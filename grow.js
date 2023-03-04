/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail("grow.js");

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
				if (ns.hasRootAccess(innerList[k]) == true) {
					if (ns.getServerRequiredHackingLevel(innerList[k]) <= ns.getHackingLevel()) {
						if (!starterList.includes(innerList[k])) {
							starterList.push(innerList[k]);
						}
					}
				}
			}
		}
		//remove home and darkweb from the list
		var index = [starterList.indexOf("home"), starterList.indexOf("darkweb")];
		for (var i = 0; i < index.length; i++) {
			if (index[i] !== -1) {
				starterList.splice(index[i], 1);
			}
		}

		ns.print(starterList);

		//1.1#############################--cycle through servers and grow each one--############################//

		var totalTime = 0.00;

		for (var x = 0; x < starterList.length; x++) {

			ns.print(ns.hackAnalyzeChance(starterList[x]).toFixed(2));

			var growthTime = ns.getGrowTime(starterList[x]);
			var weakTime = ns.getWeakenTime(starterList[x]);
			var growSeconds = Math.floor(growthTime / 1000);
			var weakSeconds = Math.floor(weakTime / 1000);			
			
			if (ns.hackAnalyzeChance(starterList[x]).toFixed(2) < 0.50) {
				totalTime += weakSeconds;
				ns.print("Running weaken on " + starterList[x] + " in " + weakSeconds + " seconds");
				await ns.weaken(starterList[x]);
			} else {
				totalTime += growSeconds;
				ns.print("Running grow on " + starterList[x] + " in " + growSeconds + " seconds");
				await ns.grow(starterList[x]);
			}
		}
		ns.print("Total time on cycle " + totalTime + " seconds");
		await ns.sleep(500);
	}
}