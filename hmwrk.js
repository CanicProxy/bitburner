/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	/*
	INDEX:
	1.0 - create list
	1.1 - determine how many cracks we have
	1.2 - break into list
	1.3 - copy hack.js over to all servers
	1.4 - run hack.js on each possible server for most amount of memory
	*/

	ns.tail("hmwrk.js");

	while (true) {

		//1.0############################--Build a list of all servers--################################//	
		var starterList = [];

		//scan from home and add to the list
		var scanList = ns.scan("home");

		//add initial home scan results
		for (var i = 0; i < scanList.length; i++) {
			starterList.push(scanList[i]);
		}

		//scan entire starterList and if result is not in the list then add it
		for (var j = 0; j < starterList.length; j++) {
			var innerList = ns.scan(starterList[j]);
			for (var k = 0; k < innerList.length; k++) {
				if (!starterList.includes(innerList[k])) {
					starterList.push(innerList[k]);
				}
			}
		}
		//remove home from the list
		var index = starterList.indexOf("home");
		if (index !== -1) {
			starterList.splice(index, 1);
		}

		//1.1############################--Get node crack count--########################################//

		var bruteCount = 0;

		var bruteList = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];
		var dirList = ns.ls("home");

		for (var h = 0; h < dirList.length; h++) {
			var item = dirList[h];
			if (bruteList.includes(item)) {
				ns.print(item);
				bruteCount++;
			}
		}

		//1.2############################--Break into the list--#########################################//

		for (var x = 0; x < starterList.length; x++) {

			var breakItem = starterList[x];

			if (bruteCount >= 1) {
				ns.brutessh(breakItem);
			}
			if (bruteCount >= 2) {
				ns.ftpcrack(breakItem);
			}
			if (bruteCount >= 3) {
				ns.relaysmtp(breakItem);
			}
			if (bruteCount >= 4) {
				ns.httpworm(breakItem);
			}
			if (bruteCount >= 5) {
				ns.sqlinject(breakItem);
			}
			if (ns.getServerNumPortsRequired(starterList[x]) <= bruteCount) {
				ns.nuke(starterList[x]);				
			}
		}

		//1.3###########################--Copy hack.js over to each server--##############################//

		for (var y = 0; y < starterList.length; y++) {
			ns.scp("hack.js", starterList[y]);
		}

		//1.4###########################--run hack.js for max mem if possible--##########################//

		for (var i = 0; i < starterList.length; i++) {

			var currentSer = starterList[i];

			if (ns.hasRootAccess(currentSer) == true) {

				var serMaxRam = ns.getServerMaxRam(currentSer);
				var serUsedRam = ns.getServerUsedRam(currentSer);
				var serAvailableRam = Math.floor(serMaxRam - serUsedRam);
				var threadCount = Math.floor(serAvailableRam / ns.getScriptRam("hack.js", currentSer))
				if (threadCount > 0) {
					ns.print("ThreadCount: " + threadCount);
				}

				if (threadCount > 0) {
					if (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(currentSer)) {
						ns.exec("hack.js", currentSer, threadCount);
					}
				}
			}
		}
		ns.print("Sleeping...");
		await ns.sleep(50000);
	}
}