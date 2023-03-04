/** @param {NS} ns */
export async function main(ns) {
    ns.tail("server.js");
    ns.clearLog("server.js");

    var list = ["disableLog", "getServerMoneyAvailable", "getPurchasedServerCost", "scan"];

    for (var x = 0; x < list.length; x++) {
        ns.disableLog(list[x]);
    }

    var serList = ns.scan("home");
    var serCount = 0;
    for (var y = 0; y < serList.length; y++) {
        if (serList[y].includes("canicServer") == true) {
            serCount++;
        }
    }
    ns.print("Server Count: " + serCount);

    var serName = "canicServer" + (serCount + 1);
    var homeMoney = ns.getServerMoneyAvailable("home");

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    for (var i = 1; i < 25; i++) {

        var powerOf = i;
        var maxPow = Math.pow(2, powerOf);

        if (ns.getPurchasedServerCost(maxPow) >= homeMoney || maxPow > 524289) {
            var buyAmt = Math.pow(2, (powerOf - 1));
            ns.print("Total Ram: " + buyAmt);
            var totalCost = ns.getPurchasedServerCost(buyAmt);
            var totalFormat = formatter.format(totalCost);
            ns.print("Server Name: " + serName);
            ns.print("Total Cost " + totalFormat);
            var nextCost = ns.getPurchasedServerCost(maxPow);
            ns.print("Next upgrade at " + formatter.format(nextCost));


            if (buyAmt == 524288) {

                ns.print("this triggered!");                
   
               ns.purchaseServer(serName, buyAmt);
               ns.scp("grow.js", serName, "home");
   
               var serMaxRam = ns.getServerMaxRam(serName);
               var serUsedRam = ns.getServerUsedRam(serName);
               var serAvailableRam = Math.floor(serMaxRam - serUsedRam);
               var threadCount = Math.floor(serAvailableRam / ns.getScriptRam("grow.js", serName));
   
               ns.exec("grow.js", serName, threadCount);   
               
            }
            break;
        }
    }
}