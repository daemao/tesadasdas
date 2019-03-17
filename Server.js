const  request = require("request");
const    cheerio = require("cheerio");
// const   youtube_url = "https://www.youtube.com/results?search_query=technology";
var detectCharset = require('detect-charset');

//HABR берет топ посты за предыдущий месяц
const   habr_url = "https://habr.com/ru/top/monthly/"
const Iconv = require ("iconv");
var Buffer = require('buffer').Buffer;
//пикабу берет топ посты за предыдущий месяц по категории айти
const   pikabu_url = "https://pikabu.ru/tag/IT?d=4065&D=4093";

setInterval(function() {
    var total_tags = [];
	// HABR request
	request(habr_url, function (error, response, body) {
	    if (!error) {
	         var $ = cheerio.load(body);
	         var elems = [];
	        
	         posts = $("div.posts_list article ")
	         .each(function (index, element) {
	         		let $$ = cheerio.load(element);
	         		var likes = 0;
	         		var shares = 0;
	         		var views = 0;
	         		var comments = 0;
	         		$$("footer.post__footer ul li ").each((i,e)=>{
	         				let temp = $$(e).children().children().text();
	         				let int = temp.replace("k","000").replace("M","000000").replace(",","");
	         				int = int*1;
	         				if(i == 1) likes=int;
	     					if(i == 2) shares=int;
	 						if(i == 3) views=int;
							if(i == 4) comments=int;
	         			});
	         		let total = likes+shares+views+comments;

	         		$$("ul.post__hubs li a").each((i,hub)=>{
	         			
	         			let topic = $$(hub).text()
	         			console.log("aaaaa2",detectCharset(topic));
	         			if (total_tags.filter(e=>e.name == topic).length == 0){
	         				total_tags.push({name:topic,value:total});
	         			}else{
	         				total_tags.forEach(e=>{
	         					if(e.name == topic)e.value = e.value+total;
	         				})
	         			} 
	         		})
			})

	    } else {
	        console.log("Произошла ошибка: " + error);
	    }
	});

	request(pikabu_url, function (error, response, body) {
	    if (!error) {
	        var $ = cheerio.load(body);
	        $("article.story").each((i,e)=>{
	        	var likes = 0;
	         	let $$ = cheerio.load(e);
	         	likes = $$("div.story__rating-count").text()*1;
	         	$$("a.tags__tag").each((i,hub)=>{
	         			let  topic =$$(hub).text();
	         			console.log("c",detectCharset(topic));
	         			var iconv = new Iconv.Iconv("windows-1251", 'utf-8');
						x = iconv.convert(topic);

						topic = x.toString();
						console.log("c2",detectCharset(topic));
	         			if (total_tags.filter(e=>e.name == topic).length == 0){
	         				total_tags.push({name:topic,value:likes});
	         			}else{
	         				total_tags.forEach(e=>{
	         					if(e.name == topic)e.value = e.value+likes;
	         				})
	         			} 
	         		})

	        })
	        sendToServer(total_tags);
	    } else {
	        console.log("Произошла ошибка: " + error);
	    }
	});


		
}, 30*10000); // 30 * 1000 milsec
	function sendToServer(total_tags){
		console.log(new Date(),":send data to the server");
		request.post({
		  headers: {'content-type' : 'application/json'},
		  url:     'http://18.216.120.74/trends',
		  body:    JSON.stringify(total_tags)
		}, function(error, response, body){
				console.log("sending2")
		  		console.log(body);
		  		console.log(error);
		});
	}
//тут приведен пример с технологией

// var fetchVideoInfo = require('youtube-info');
// // получает список ссылок на первые 18 записей в ютубе
// request(youtube_url, function (error, response, body) {
//     if (!error) {
//          var $ = cheerio.load(body);
//          var elems = [];
//          videos = $("a").attr('id','video-title')
//          .attr("class","yt-simple-endpoint style-scope ytd-video-renderer")
//          .each(function (index, element) {
//          	let url = $(element).attr('href');
//          	if(url.startsWith("/watch?") && elems.indexOf(url)<0){
//          		elems.push("https://www.youtube.com"+$(element).attr('href'));
//          	}
// 		})
//          for (x in elems){
//          	getYoutubeVideoDataByUrl(elems[x],(data)=>{
//          		console.log(data);
//          	});
//          }
//     } else {
//         // console.log("Произошла ошибка: " + error);
//     }
// });

// //test youtube video
// getYoutubeVideoDataByUrl("https://www.youtube.com/watch?v=xI0uGBEPMts",(video_info)=>{
// 	console.log(video_info);
// });

// function getYoutubeVideoDataByUrl(url,callback){
// 	let x = url.split("watch?v=")[1];
// 	fetchVideoInfo(x, function ( err, videoInfo) {
//   		if (err) throw new Error(err);
//   		let video = {};
//   		video.published_date = videoInfo.datePublished;
//   		video.views = videoInfo.views;
//   		video.genre = videoInfo.genre;
//   		video.title = videoInfo.title;
//   		video.likes = videoInfo.likeCount;
//   		video.dislikes = videoInfo.dislikeCount;
//   		video.comments = videoInfo.commentCount;
//   		// console.log("age:"+moment("2011-10-31", "YYYY-MM-DD").fromNow());
// 	});
// }



