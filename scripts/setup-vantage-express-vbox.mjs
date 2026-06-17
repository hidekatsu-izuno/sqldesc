#!/usr/bin/env node
/**
 * Import and start Teradata Vantage Express on Windows VirtualBox from WSL.
 *
 * Prerequisites:
 * - VirtualBox installed on Windows (winget install Oracle.VirtualBox)
 * - Vantage Express OVA downloaded from https://downloads.teradata.com/download/database/teradata-express/vmware
 *
 * Usage:
 *   node scripts/setup-vantage-express-vbox.mjs /path/to/VantageExpress.ova
 *   node scripts/setup-vantage-express-vbox.mjs --status
 *   node scripts/setup-vantage-express-vbox.mjs --stop
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import process from "node:process";

const vmName = process.env.VANTAGE_VM_NAME ?? "sqldesc-vantage";
const teradataPort = process.env.TERADATA_PORT ?? "1025";
const vboxManage =
  process.env.VBOX_MANAGE ??
  "/mnt/c/Program Files/Oracle/VirtualBox/VBoxManage.exe";

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    shell: false,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function vbox(...args) {
  if (!existsSync(vboxManage)) {
    throw new Error(
      `VBoxManage not found at ${vboxManage}. Install VirtualBox on Windows: winget install Oracle.VirtualBox`,
    );
  }
  return run(vboxManage, args);
}

function vmExists() {
  const result = vbox("showvminfo", vmName);
  return result.status === 0;
}

function vmState() {
  const result = vbox("showvminfo", vmName, "--machinereadable");
  if (result.status !== 0) return null;
  const match = result.stdout.match(/^VMState="([^"]+)"/m);
  return match?.[1] ?? null;
}

function portOpen(host, port, timeoutMs = 2000) {
  const result = spawnSync(
    "bash",
    [
      "-c",
      `timeout ${Math.ceil(timeoutMs / 1000)} bash -c 'echo > /dev/tcp/${host}/${port}' 2>/dev/null`,
    ],
    { encoding: "utf8" },
  );
  return result.status === 0;
}

function windowsHostFromWsl() {
  try {
    const result = spawnSync("grep", ["nameserver", "/etc/resolv.conf"], { encoding: "utf8" });
    const line = result.stdout.trim().split("\n")[0] ?? "";
    const host = line.split(/\s+/)[1];
    return host || "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}

function teradataHosts() {
  const hosts = ["127.0.0.1", windowsHostFromWsl()];
  return [...new Set(hosts)];
}

function toVBoxPath(filePath) {
  if (!filePath.startsWith("/")) return filePath;
  const result = run("wslpath", ["-w", filePath]);
  if (result.status === 0 && result.stdout.trim()) return result.stdout.trim();
  return filePath;
}

function importOva(ovaPath) {
  const vboxOvaPath = toVBoxPath(ovaPath);
  if (!existsSync(ovaPath) && !existsSync(vboxOvaPath)) {
    throw new Error(`OVA not found: ${ovaPath}`);
  }
  console.log(`Importing ${vboxOvaPath} as "${vmName}" (this may take several minutes)...`);
  const result = vbox(
    "import",
    vboxOvaPath,
    "--vsys",
    "0",
    "--vmname",
    vmName,
    "--memory",
    "6144",
    "--cpus",
    "2",
    "--settingsfile",
    "sqldesc-vantage.vbox",
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "VBoxManage import failed");
  }
}

function sleepMs(ms) {
  spawnSync("sleep", [String(Math.ceil(ms / 1000))]);
}

function needsNetworkReconfigure() {
  const info = vbox("showvminfo", vmName, "--machinereadable");
  if (info.status !== 0) return true;
  const nic1 = info.stdout.match(/^nic1="([^"]+)"/m)?.[1];
  const hasForward = new RegExp(`hostport=${teradataPort}(?:,|\\")`).test(info.stdout);
  return nic1 !== "nat" || !hasForward;
}

function configureNetworking() {
  if (!needsNetworkReconfigure()) {
    console.log("NAT networking and port forwarding already configured");
    return;
  }

  const state = vmState();
  if (state === "running") {
    console.log("Stopping VM to configure networking...");
    vbox("controlvm", vmName, "acpipowerbutton");
    for (let i = 0; i < 24; i += 1) {
      if (vmState() !== "running") break;
      sleepMs(5000);
    }
    if (vmState() === "running") {
      vbox("controlvm", vmName, "poweroff");
    }
  }

  vbox("modifyvm", vmName, "--uart1", "0x3F8", "4");
  vbox("modifyvm", vmName, "--nic1", "nat");
  vbox("modifyvm", vmName, "--natpf1", "delete", "teradata");
  const result = vbox(
    "modifyvm",
    vmName,
    "--natpf1",
    `teradata,tcp,,${teradataPort},,${teradataPort}`,
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "failed to configure port forwarding");
  }
  console.log(`Configured NAT networking with port forward: host ${teradataPort} -> guest ${teradataPort}`);
}

function configurePortForward() {
  configureNetworking();
}

function startVm() {
  const state = vmState();
  if (state === "running") {
    console.log(`VM "${vmName}" is already running`);
    return;
  }
  console.log(`Starting VM "${vmName}" (headless)...`);
  const result = vbox("startvm", vmName, "--type", "headless");
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "VBoxManage startvm failed");
  }
}

function stopVm() {
  if (!vmExists()) {
    console.log(`VM "${vmName}" does not exist`);
    return;
  }
  const state = vmState();
  if (state !== "running") {
    console.log(`VM "${vmName}" is not running (state=${state ?? "unknown"})`);
    return;
  }
  console.log(`Stopping VM "${vmName}"...`);
  vbox("controlvm", vmName, "acpipowerbutton");
}

async function waitForTeradata(maxMinutes = 45) {
  const deadline = Date.now() + maxMinutes * 60 * 1000;
  console.log(
    `Waiting for Teradata on port ${teradataPort} (boot can take 15-30 minutes on first start)...`,
  );
  while (Date.now() < deadline) {
    for (const host of teradataHosts()) {
      if (portOpen(host, teradataPort)) {
        console.log(`Teradata port is open at ${host}:${teradataPort}`);
        if (host !== "127.0.0.1") {
          console.log(`From WSL/Docker, use: TERADATA_HOST=${host}`);
        }
        return host;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 15000));
    process.stdout.write(".");
  }
  throw new Error(
    `Teradata did not become reachable on port ${teradataPort} within ${maxMinutes} minutes`,
  );
}

function printStatus() {
  console.log(`VBoxManage: ${vboxManage}`);
  console.log(`VM name: ${vmName}`);
  if (!vmExists()) {
    console.log("Status: VM not imported");
    console.log(
      "Download OVA from https://downloads.teradata.com/download/database/teradata-express/vmware",
    );
    console.log("Then run: node scripts/setup-vantage-express-vbox.mjs /path/to/VantageExpress.ova");
    return;
  }
  console.log(`Status: ${vmState() ?? "unknown"}`);
  for (const host of teradataHosts()) {
    const open = portOpen(host, teradataPort);
    console.log(`Port ${host}:${teradataPort}: ${open ? "open" : "closed"}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--status")) {
    printStatus();
    return;
  }
  if (args.includes("--stop")) {
    stopVm();
    return;
  }
  if (args.includes("--wait-only")) {
    await waitForTeradata();
    return;
  }

  const ovaPath = args.find((arg) => !arg.startsWith("-"));
  if (!vmExists()) {
    if (!ovaPath) {
      throw new Error(
        "Vantage Express OVA path required for first-time setup.\n" +
          "Download from https://downloads.teradata.com/download/database/teradata-express/vmware\n" +
          "Usage: node scripts/setup-vantage-express-vbox.mjs /path/to/VantageExpress.ova",
      );
    }
    importOva(ovaPath);
  } else {
    console.log(`VM "${vmName}" already exists, skipping import`);
  }

  configurePortForward();
  startVm();
  const host = await waitForTeradata();
  console.log("\nReady. Run verification with:");
  if (host !== "127.0.0.1") {
    console.log(`  TERADATA_HOST=${host} node scripts/verify-teradata-doc.mjs`);
  } else {
    console.log("  node scripts/verify-teradata-doc.mjs");
  }
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
