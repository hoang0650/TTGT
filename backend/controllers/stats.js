const TrafficEvent = require('../models/trafficevent');

function eventsHeatmap(req, res){
     const startDate = new Date(req.query.startDate || (Date.now() - 30 * 24 * 60 * 60 * 1000));
     const endDate = new Date(req.query.endDate || Date.now());
     const query = {
        createdAt: {
            $gte: startDate,
            $lt: endDate
        },
        $or: [{
                status: 'updated',
            },
            {
                status: 'approved',
            }
        ]
    };

    TrafficEvent.find(query).exec().then(
        (events) => {
             const points = events.map(e => {
                return [e.loc.coordinates[1], e.loc.coordinates[0]];
            });
            res.json(points);
        },
        () => res.status(400).end()
    );
};

function eventsWeekly (req, res){
     const startDate = new Date(req.query.startDate || (Date.now() - 30 * 24 * 60 * 60 * 1000));
     const endDate = new Date(req.query.endDate || Date.now());
     const query = {
        createdAt: {
            $gte: startDate,
            $lt: endDate
        },
        $or: [{
                status: 'updated',
            },
            {
                status: 'approved',
            }
        ]
    };

    let results = {
        labels: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        series: ['Tin tự động', 'Người vận hành'],
        data: [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ],
        colors: ['#ff0000', '#0092ff']
    };

    TrafficEvent.find(query).exec().then(
        (events) => {
            events.forEach(e => {
                 const dayOfWeek = e.createdAt.getDay();

                // if (e.values) {
                    // if (e.values.velocity) {
                        if (e.creator && e.creator.source === 'AutoEvent') {
                            results.data[0][dayOfWeek] = results.data[0][dayOfWeek] || 0;
                            results.data[0][dayOfWeek] += 1;
                        } else {
                            results.data[1][dayOfWeek] = results.data[1][dayOfWeek] || 0;
                            results.data[1][dayOfWeek] += 1;
                        }
                    // }
                // }
            });

            res.json(results);
        },
        () => res.status(400).end()
    );
};

function csv (req, res){
     const startDate = new Date(req.query.startDate || (Date.now() - 30 * 24 * 60 * 60 * 1000));
     const endDate = new Date(req.query.endDate || Date.now());
     const query = {
        createdAt: {
            $gte: startDate,
            $lt: endDate
        },
        $or: [{
                status: 'updated',
            },
            {
                status: 'approved',
            }
        ]
    };

     const filename = 'ttgt_camera-giao-thong.csv';
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('content-type', 'text/csv');
    TrafficEvent.findAndStreamCsv(query).pipe(res);

    // TrafficEvent.find(query).stream().pipe(
    //     (events) => {
    //         let results = events.map(e => '"' + e.desc[0] + '", "' + e.desc[1] + '","' + e.createdAt.toISOString() + '","' + e.creator.source + ' - ' + e.creator.name + '"');

    //          const filename = 'ttgt_camera-giao-thong.csv';
    //         res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    //         res.setHeader('content-type', 'text/csv');

    //         // fs.createReadStream(file);
    //         // filestream.pipe(res);

    //         // let buffer = new Buffer(results, 'binary');

    //         res.end(new Buffer(results, 'binary'));
    //     },
    //     () => res.status(400).end
    // );
};

function eventsMonthly (req, res){
     const startDate = new Date(req.query.startDate || (Date.now() - 30 * 24 * 60 * 60 * 1000));
     const endDate = new Date(req.query.endDate || Date.now());
     const query = {
        createdAt: {
            $gte: startDate,
            $lt: endDate
        },
        $or: [{
                status: 'updated',
            },
            {
                status: 'approved',
            }
        ]
    };

    let results = {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
        series: ['Tin tự động', 'Người vận hành'],
        data: [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ],
        colors: ['#ff0000', '#0092ff']
    };

    TrafficEvent.find(query).exec().then(
        (events) => {
            events.forEach(e => {
                 const month = e.createdAt.getMonth();

                // if (e.values) {
                //     if (e.values.velocity) {
                        if (e.creator && e.creator.source === 'AutoEvent') {
                            results.data[0][month] = results.data[0][month] || 0;
                            results.data[0][month] += 1;
                        } else {
                            results.data[1][month] = results.data[1][month] || 0;
                            results.data[1][month] += 1;
                        }
                //     }
                // }
            });

            res.json(results);
        },
        () => res.status(400).end()
    );
};

module.exports = {
    eventsHeatmap,eventsWeekly,csv,eventsMonthly
}