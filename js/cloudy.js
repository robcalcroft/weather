var app = {

	variables : {
		resultsFlag: false,
		weatherIconList : {

			clear:         "wi wi-day-sunny",
			cloudy:        "wi wi-cloudy",
			cloudsWithSun: "wi wi-day-cloudy",
			showerRain:    "wi wi-rain",
			rain:          "wi wi-day-rain",
			thunderStorm:  "wi wi-thunderstorm",
			snow:          "wi wi-snow",
			mist:          "wi wi-fog"

		}
	},

	letsGo : function() {
		app.inputWatch();
		app.tooltips();
	},

	tooltips : function() {
		// Entry box
		$('#location-entry-box').tooltipster({
			animation: 'grow',
			speed: '150',
			trigger: 'custom',
		})
		$('#weather-error').tooltipster({
			animation: 'grow',
			speed: '150',
			trigger: 'custom'
		})
		// Results
		$("i.hltemp").tooltipster({
			position: 'left',
			speed:150,
			iconTouch:true,
		})
		// Previous searches
		$('div.prev-searches').tooltipster({
			position: 'bottom',
			speed:150,
			content:(function() {
				if(localStorage.weatherer) {
					var weatherer = JSON.parse(localStorage.weatherer), list, container = document.createElement('div'), top = document.createElement('div'), top_right = document.createElement('div'), top_left = document.createElement('div');
					list = document.createElement('ul')
					list.classList.add('prev-searches-results')
					$.each(weatherer.searches, function(_, val) {
						var item = document.createElement('li'); item.innerHTML = val;
						list.appendChild(item);
					})
					top.classList.add('prev-searches-results-top')
					top_right.innerHTML = 'X'; top_right.classList.add('prev-searches-results-top-right');
					top_left.innerHTML = 'Clear'; top_left.classList.add('prev-searches-results-top-left');
					top.appendChild(top_left); top.appendChild(top_right);
					container.appendChild(top)
					container.appendChild(list)
					return container.innerHTML;
				}
			})(),
			contentAsHTML:true,
			trigger: 'custom',
			interactive:true
		})
		// $('div.prev-searches').tooltipster('show', function() {
		// 	delay(500,function() {
		// 		$('div.prev-searches-results-top-right').click(function() {
		// 			$('div.prev-searches').tooltipster('hide')
		// 		})
		// 		$('div.prev-searches-results-top-left').click(function() {
		// 			localStorage.clear()
		// 		})
		// 	})
		// })
	},

	inputWatch : function() {
		$(window).keypress(function(e) {
			if (e.which == 13) {
				var box = $('#location-entry-box').val();
				if(box.match(/( )+|^$/)) {
					app.showHideToolTip('#location-entry-box')
				} else { app.weather.getWeather(box) }
			}
		})
	},

	showHideToolTip : function(selector) {
		$(selector).tooltipster('show');
		delay(2500, function() {$(selector).tooltipster('hide')})
	},

	weather : {

		getWeather : function(location) {
			$('#header').addClass('fa-spin');
			app.weather.saveSearch(location)
			$.getJSON('http://api.openweathermap.org/data/2.5/weather?q='+location, app.weather.useWeather).error(app.weather.weatherErr)
		},

		saveSearch : function(entry) {
			if(localStorage) {
				if(localStorage.weatherer) {
					var ls = JSON.parse(localStorage.weatherer)
					ls.searches.push(entry);
					localStorage.weatherer = JSON.stringify(ls)
				} else {
					localStorage.clear()
					var s = [], o = {};
					s.push(entry);
					o.searches = s;
					localStorage.weatherer = JSON.stringify(o)
				}
			}
		},

		useWeather : function(weather) {
			echo(weather);
			setTimeout(function(){$('#header').removeClass('fa-spin')}, 1000);
			if(weather.cod != 200) {
				app.weather.weatherErr();
				return false;
			}
			var desc = weather.weather[0].description, highTemp = weather.main.temp_max, lowTemp = weather.main.temp_min, f = app.variables.resultsFlag;
			$('#res-head').html(weather.name+', '+weather.sys.country);
			$('span#weather-desc').html(function() {
				if(desc[0] != desc[0].toUpperCase()) {
					desc = desc.substr(0,1).toUpperCase() + desc.substr(1)
				}
				return desc
			});
			$('#weather-low').html(app.weather.kelvinToCelsius(lowTemp));
			$('#weather-high').html(app.weather.kelvinToCelsius(highTemp));
			$('#weather-icon').removeClass().addClass(app.weather.getIcon(desc)) // update the weather icon
			if(!f) {
				$("#location-entry-box, #weather-error").animate({fontSize:'20pt',marginTop:'0'}, {duration:500,queue:false,complete:function() {
					$('div.results').fadeIn();
				}})
			}
			app.variables.resultsFlag = !f;
		},

		weatherErr : function() {
			try{delay(1000, function(){$('#header').removeClass('fa-spin')})}catch(e){};
			app.showHideToolTip('#weather-error')
		},

		getIcon: function(desc) {
			echo(desc)
			if(desc.match(/clear/i)) {
				return app.variables.weatherIconList.clear
			} else if((desc.match(/few/i) || desc.match(/overcast/i)) && desc.match(/cloud(s)?/i)) {
				return app.variables.weatherIconList.cloudy
			} else if((desc.match(/scattered/i) || desc.match(/broken/i)) && desc.match(/cloud(s)?/i)) {
				return app.variables.weatherIconList.cloudsWithSun
			} else if(desc.match(/shower(s)?/i) && desc.match(/rain/i)) {
				return app.variables.weatherIconList.showerRain
			} else if(desc.match(/rain/i)) {
				return app.variables.weatherIconList.rain
			} else if(desc.match(/thunder/i)) {
				return app.variables.weatherIconList.thunderStorm
			} else if(desc.match(/snow/i)) {
				return app.variables.weatherIconList.snow
			} else if(desc.match(/mist/i)) {
				return app.variables.weatherIconList.mist
			} else {
				return app.variables.weatherIconList.cloudsWithSun
			}
		},

		kelvinToCelsius : function(k) {
			return Math.round(k-273.15)
		}
	}


}

// So lets go
$(document).ready(app.letsGo)
