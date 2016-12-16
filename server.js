(function() {
	"use strict";
	var express = require('express');
	var yc = require('ytdl-core');
	var fs = require('fs');
	var ffmpeg = require('fluent-ffmpeg');

	var app = express();

	var rootPath = {
		'root': 'dist/'
	};

	var yregex = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/;

	function printToFile(data) {
		fs.appendFile("logs.txt", data + "\n");
	}

	/**
	 * Custom console log/error.
	 * @param  {JSONObject} data {msg, ip, type}
	 */
	function print(data) {
		if (!data.ip) {
			data.ip = " - ";
		}
		if (!data.type) {
			data.type = " - ";
		}
		var format = new Date().toLocaleString() + " [" + data.ip + "] " + JSON.stringify(data.msg);
		if (data.type === "err") {
			console.error(format);
		}
		else {
			console.log(format);
		}
		printToFile(format);
	}

	function getIp(req) {
		return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	}

	/**
	 * Custom error logging
	 * @param  {[type]} data {err {message}, req, res}
	 */
	function throwErr(data) {
		print({
			type: "err",
			msg: data.err,
			ip: getIp(data.req)
		});
		data.res.status(data.err.status || 500);
		data.res.json({
			message: data.err.message,
			error: data.err
		});
	}

	function throwFourOFour(res) {
		res.sendFile('404.html', rootPath);
	}

	function serveIndex(res) {
		res.sendFile('index.html', rootPath);
	}

	function serveFile(file, res) {
		var path = __dirname + '/dist/' + file;
		fs.exists(path, function(exists) {
			if (exists) {
				res.sendFile(file, rootPath);
			}
			else {
				throwFourOFour(res);
				return;
			}
		});
	}

	function serveDirFile(dir, file, res) {
		var path = __dirname + '/dist/' + dir + '/' + file;
		fs.exists(path, function(exists) {
			if (exists) {
				res.sendFile(dir + '/' + file, rootPath);
			}
			else {
				throwFourOFour(res);
				return;
			}
		});
	}

	function processGet(req, res) {

		if (!req.query.link) {
			throwErr({
				err: {
					message: "No link parameter provided!"
				},
				req: req,
				res: res
			});
			return;
		}

		var link = req.query.link.match(yregex);
		if (!link) {
			throwErr({
				err: {
					message: "Not a valid YouTube link!"
				},
				req: req,
				res: res
			});
			return;
		}

		link = link[0];
		print({
			msg: "Received link: " + link,
			ip: getIp(req)
		});

		yc.getInfo(link, function(err, info) {
			if (err) {
				throwErr({
					err: err,
					req: req,
					res: res
				});
				return;
			}

			var stream = yc(link);
			var curatedTitle = info.title.replace(/[\>\<\:\"\\\/\|\?\*\.]+/g, "-");
			var location = __dirname + '/mp3/' + curatedTitle + '.mp3';

			ffmpeg({
					source: stream
				})
				.withAudioCodec('libmp3lame')
				.toFormat('mp3')
				.saveToFile(location)
				.on('end', function() {
					print({
						msg: "File ready!",
						ip: getIp(req)
					});
					res.setHeader('Content-Disposition', 'attachment; filename=' + curatedTitle);
					res.download(location, curatedTitle + '.mp3', function(err) {
						if (err) {
							throwErr({
								err: err,
								req: req,
								res: res
							});
							return;
						}
						fs.unlink(location);
					});
				});
		});
	}

	function processRequest(req, res) {
		var reqParams = Object.keys(req.params).length;
		if (reqParams === 0) {
			serveIndex(res);
		}
		else if (reqParams === 1 && req.params.file) {
			serveFile(req.params.file, res);
		}
		else if (reqParams === 2 && req.params.dir && req.params.file) {
			if (req.params.dir === "youtube" && req.params.file === "process_get") {
				processGet(req, res);
			}
			else {
				serveDirFile(req.params.dir, req.params.file, res);
			}
		}
		else {
			throwFourOFour(res);
		}
	}

	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		res.header("Access-Control-Expose-Headers", "Content-Disposition");
		next();
	});

	app.get('/', processRequest);
	app.get('/:file', processRequest);
	app.get('/:dir/:file', processRequest);
	app.get('/youtube/process_get', processRequest);

	var server = app.listen(3000, '127.0.0.1', function() {
		print({
			msg: "Youtube MP3 Downloader listening at http://" + server.address().address + ":" + server.address().port
		});
	});
})();