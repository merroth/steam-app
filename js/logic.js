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
		}else
		{
			alert("Denne app henter tilbud fra Steam's tilbudsavis og sorterer dem efter rabatten.\nNogle gange som ved Steam Summer Sale er der op mod 300 siders tilbud, så vær tålmodig")
		}
	}


	var counter = 1;
	var loop = 0;
	var container = document.createElement("div");
	var JsonList = {};
	var dots = "";
	var working = false;
	function objLen(obj)
	{
		return parseInt(Object.keys(obj).length);
	}
	function fetch(counter,container,dots,JsonList)
	{
		loop++;
		$.ajax({
			type: "GET",
			timeout: (1000 * 60),
			url: "http://emilsj.dk/Andre_Filer/JavaScript/steam/getSteam.php",
			data: {"i":loop},
			success: function(response)
			{
				if(dots.lastIndexOf("...") != -1)
				{
					dots = ".";
				}else
				{
					dots+=".";
				}
				document.getElementById("status-label").innerHTML = "Working"+dots+" ("+loop+")";
				//console.log(response);
				$($.parseHTML(response)).each(function(index, element) {
					if(typeof(element.innerHTML) !== "undefined")
					{
						element.setAttribute("class",'search_result_row');
						
						var key = objLen(JsonList);
						
						JsonList[key] = {
							id : key,
							node : element
							};
												
						container.appendChild(element);			
					}
				});
			},
			error: function(x, t, m)
			{
				alert("En fejl af typen \""+t+"\" blev opfanget.\n\nTjek at du har internet forbindelse og prøv igen.");
			},
			complete: function(response)
			{
				console.log({loop:loop,response:response});
				if(response.responseText.toString().length < 5000)
				{
					console.log("done")
					getPercentage();
					document.getElementById("status-label").innerHTML = "Done";
					
					//$("#option-line").delay(1000).fadeIn(1000);
					return false;
				}
				if(loop <=500)
				{
					setTimeout(function()
					{
						fetch(counter,container,dots,JsonList);
					},250);
				}
			}
		});
	}
	function getPercentage()
	{
		var d = new Date();
		
		console.log("--------");
		
		for(var i in JsonList)
		{
			var node = JsonList[i].node.getElementsByClassName("search_price");
			if(node.length > 0)
			{
				node = node[0];
				var test = true;
				for(var y in node.children)
				{
					if(typeof(node.children[y].nodeName) === "string")
					{
						if(node.children[y].nodeName.toLowerCase() == "p")
						{
							test = false;
						}
					}
				}
				if(test)
				{
					var str =  (node.textContent || node.innerText || "").split("€");
					var org = parseFloat(str[0].replace(",",".").replace("€","").replace("--",""))
					var price = parseFloat(str[1].replace(",",".").replace("€","").replace("--",""))
					var percent = 100 - ((100 / org ) *price).toFixed(0);
					JsonList[i].percent = percent;	
					
					var p = document.createElement("p");
					
					p.innerHTML = percent+"%";
					p.classList.add("percentage_price");
					//console.log(node.children);
					node.appendChild(p);
				}
							
			}else
			{
				delete JsonList[i];
			}
		}
		
		console.log(new Date() - d, "ms: Percent calculated");
		
		var c = document.createElement("div"),
		
		JsonList2 = clone(JsonList)
		key = objLen(JsonList),
		curr = {};
		for(var i = 0; i < key + 5; i++)
		{
			var best = {id : null, node : 0, percent : 0},
			change = false;
			for(var x in JsonList2)
			{
				if(JsonList2[x].percent > best.percent)
				{
					change = true;
					best = JsonList2[x];
				}
			}
			if(change)
			{
				c.appendChild(best.node);
				delete JsonList2[best.id];
			}
		}
		console.log(new Date() - d, "ms: Dom Node Created");
		
		container = c;
		save(container);
		return false;
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
			for(var x =1; x < 500;x++)
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

			fetch(counter,container,dots,JsonList);
		}
	}
// Sort
function sortfunction(a, b)
{
	return (a.percent - b.percent)
}
function clone (obj)
{
	if (null == obj || "object" != typeof obj)
	{
		return obj;
	}
	var copy = obj.constructor();
	for (var attr in obj)
	{
		if (obj.hasOwnProperty(attr))
		{
	copy[attr] = obj[attr];
		}
	}
	return copy;
}