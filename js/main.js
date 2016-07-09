
var wsuri = "wss://api.poloniex.com";
var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});
 
connection.onopen = function (session) {

        function marketEvent (args, kwargs) {
                // console.log(args);

                var eventLength = args.length;

                for (var i = 0; i < eventLength; i++) {
                	
                	console.log(args[i]);

                	var marketEvent = args[i];
                	if marketEvent.type === "newTrade" {
                		var tradeData = marketEvent.data
                		
                	}

                }
        }

        function tickerEvent (args, kwargs) {
                console.log(args);
        }

        function trollboxEvent (args, kwargs) {
                console.log(args);
        }

        session.subscribe('BTC_ETH', marketEvent);
        // session.subscribe('ticker', tickerEvent);
        // session.subscribe('trollbox', trollboxEvent);
}
 
connection.onclose = function () {
  console.log("Websocket connection closed");
}
                       
connection.open();