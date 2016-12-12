'use strict';

const async = require('async');

const db = require('../db');
const hooks = require('./hooks');

module.exports = {

	index: hooks.adminRequired((session, cb) => {
		db.models.reports.find({}).sort({ released: 'desc' }).exec((err, reports) => {
			if (err) console.error(err);
			else cb({ status: 'success', data: reports });
		});
	}),

	create: hooks.loginRequired((session, data, cb) => {
		async.waterfall([

			(next) => {
				db.models.report.find({ createdBy: data.createdBy, createdAt: data.createdAt }).exec((err, report) => {
					if (err) console.error(err);
					if (report) return cb({ status: 'failure', message: 'Report already exists' });
					else next();
				});
			},

			(next) => {
				let issues = [
					{
						name: 'Video',
						reasons: [
							'Doesn\'t exist',
							'It\'s private',
							'It\'s not available in my country'
						]
					},
					{
						name: 'Title',
						reasons: [
							'Incorrect',
							'Inappropriate'
						]
					},
					{
						name: 'Duration',
						reasons: [
							'Skips too soon',
							'Skips too late',
							'Starts too soon',
							'Skips too late'
						]
					},
					{
						name: 'Artists',
						reasons: [
							'Incorrect',
							'Inappropriate'
						]
					},
					{
						name: 'Thumbnail',
						reasons: [
							'Incorrect',
							'Inappropriate',
							'Doesn\'t exist'
						]
					}
				];

				for (let z = 0; z < data.issues.length; z++) {
					if (issues.filter(issue => { return issue.name == data.issues[z].name; }).length > 0) {
						for (let r = 0; r < issues.length; r++) {
							if (issues[r].reasons.every(reason => data.issues[z].reasons.indexOf(reason) < -1)) {
								return cb({ 'status': 'failure', 'message': 'Invalid data' });
							}
						}
					} else return cb({ 'status': 'failure', 'message': 'Invalid data' });
				}

				next();
			},

			(next) => {
				db.models.report.create(data, next);
			}

		], err => {
			if (err) return cb({ 'status': 'failure', 'message': 'Something went wrong'});
			return cb({ 'status': 'success', 'message': 'Successfully created report' });
		});
	})

};