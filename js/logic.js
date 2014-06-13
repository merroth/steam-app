	function s5s() // supports_html5_storage
	{
		try
		{
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e)
		{
			return false;
		}
	}
	alert(s5s())
	
	if(s5s())
	{
		if( localStorage.getItem("saveSteam") !== null )
		{
			if( typeof( localStorage.getItem("saveSteam") ) === "string" )
			{
				if(localStorage.getItem("saveSteam").length > 500)
				{
					document.getElementById("master").innerHTML = localStorage.getItem("saveSteam");
				}
			}
		}
	}


	var counter = 1;
	var loop = 0;
	var container = document.createElement("div");
	var working = false;
	//document.getElementById("test").appendChild(container);
	
	function fetch(counter,container)
	{
		loop++;
		$.ajax({
			type: "GET",
			timeout: 600000,
			url: "http://emilsj.dk/Andre_Filer/JavaScript/steam/getSteam.php",
			data: {"i":loop},
			success: function(response)
			{
				if(response.toString().length < 500)
				{
					document.getElementById("status-label").innerHTML = "Done";
					
					//$("#option-line").delay(1000).fadeIn(1000);
					
					getPercentage();
					
					return false;
				}
				if(document.getElementById("status-label").innerHTML.lastIndexOf("...") != -1)
				{
					document.getElementById("status-label").innerHTML = document.getElementById("status-label").innerHTML.replace("...",".");
				}else
				{
					document.getElementById("status-label").innerHTML+=".";
				}
				//console.log(response);
				$($.parseHTML(response)).each(function(index, element) {
					if(typeof(element.innerHTML) !== "undefined")
					{
						element.setAttribute("class",'search_result_row');		
						
						container.appendChild(element);			
					}
				});
				if(loop <=50)
				{
					fetch(counter,container);
				}
			}
		});
	}
	function getPercentage()
	{
		for(var i in container.getElementsByClassName("search_price"))
		{
			for( var x in container.getElementsByClassName("search_price")[i].childNodes)
			{
				if( container.getElementsByClassName("search_price")[i].childNodes[x].nodeName == "#text" )
				{
					var price = parseFloat( container.getElementsByClassName("search_price")[i].childNodes[x].textContent.replace(",",".").replace("€","") )
				}
				if( container.getElementsByClassName("search_price")[i].childNodes[x].nodeName == "SPAN" )
				{
					var org = parseFloat(container.getElementsByClassName("search_price")[i].childNodes[x].innerHTML.replace(",",".").replace("<strike>","").replace("€ </strike>",""));
				}
			}
			if( typeof(container.getElementsByClassName("search_price")[i]) === "object" )
			{
				if(container.getElementsByClassName("search_price")[i].getElementsByClassName("percentage_price").length < 1)
				{
					var p = document.createElement("p");
					p.innerHTML = (100 - ((100 / org) * price)).toFixed(0) + "%";
					p.setAttribute("class","percentage_price");
		
					if(container.getElementsByClassName("search_price")[i].nodeName == "DIV")
					{
						container.getElementsByClassName("search_price")[i].appendChild(p);
					}
				}
			}
		}
		for(var y = 0; y<= 1000; y++)
		{
			var change = false;
			var prev = 12, current = 1;
			for(var i in container.getElementsByClassName("search_price"))
			{
				if(container.getElementsByClassName("search_price")[i].nodeName == "DIV")
				{
					var current = container.getElementsByClassName("search_price")[i].getElementsByClassName("percentage_price")[0].innerHTML.replace("%","").replace(" ","");
				}
				if(current > prev)
				{
					var prevNode = container.getElementsByClassName("search_price")[(i-1)];
					currNode = (container.getElementsByClassName("search_price")[i])
					if(typeof(prevNode) !== "undefined")
					{
						change = true;
						container.insertBefore(currNode.parentNode,prevNode.parentNode);
					}
				}
				prev = current;
			}
			if(!change)
			{
				save(container);
				return false;
			}
		}
	}
	function check(sender,str)
	{
		var checkBoc = document.getElementById("master");
		if( sender.checked == false)
		{
			for(var i in checkBoc.getElementsByClassName("search_type"))
			{
				var el = checkBoc.getElementsByClassName("search_type")[i];
				for( var x in el.childNodes)
				{
					if(el.childNodes[x].nodeName == "IMG")
					{
						if(el.childNodes[x].src.lastIndexOf(str) != -1)
						{
							el.parentNode.setAttribute("class",
							el.parentNode.getAttribute("class")+" hide"
							)
						}
					}
				}
			}
		}else
		{
			for(var i in checkBoc.getElementsByClassName("search_type"))
			{
				var el = checkBoc.getElementsByClassName("search_type")[i];
				for( var x in el.childNodes)
				{
					if(el.childNodes[x].nodeName == "IMG")
					{
						if(el.childNodes[x].src.lastIndexOf(str) != -1)
						{
							el.parentNode.setAttribute("class",
							el.parentNode.getAttribute("class").replace(" hide","")
							)
						}

					}
				}
			}			
		}
	}
	function save(container)
	{
		function cleanUp()
		{
			for(var x =1; x < 200;x++)
			{
				for(var i in container.childNodes)
				{
					if(typeof(container.childNodes[i]) !== "undefined")
					{
						if(container.childNodes[i].nodeName == "DIV")
						{
							container.removeChild(container.childNodes[i]);
						}
					}
				}
				if(x >= 90)
				{
					return true;
				}
			}
		}
		if(cleanUp() == true)
		{
			var str = container.innerHTML.toString();
			
			localStorage.setItem("saveSteam", str);
			document.getElementById("master").innerHTML = str;
			document.getElementById("option-line").classList.remove("hide");
			
			
			counter = 1;
			loop = 0;
			working = false;
		}
	}
	function clickActivate(sender)
	{
		if(working == false)
		{
			container = document.createElement("div");
			working = true;
			sender.innerHTML = "Working";
			document.getElementById("option-line").classList.add("hide");

			fetch(counter,container);
		}
	}
localStorage.setItem("saveSteam", "");