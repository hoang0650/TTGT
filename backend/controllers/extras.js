const pg = require('pg');
pg.defaults.poolSize = 20;
//const mapdbConString = 'postgres://maprenderer@mapdb/routing';
const mapdbConString = 'postgres://routing@mapdb:5433/hcm-routing';

// exports.create = function (req, res) {
//     const parking = new Roadwork(req.body);
//     parking.save().then(park => res.status(200).send(park),
//         err => res.status(500).send(err));
// };
// exports.findAll = function (req, res) {
//     Roadwork.find({}).sort('startAt').exec()
//         .then(prk => res.status(200).send(prk),
//             err => res.status(500).send(err));
// };
// exports.update = function (req, res) {
//     const requestRoadwork = new Roadwork(req.body);
//     const rw = req.body.roadwork;
//     delete requestRoadwork._id;
//     _.extend(rw, requestRoadwork);
//     rw.update(rw).then(stt => { res.status(200).send(stt); }, err => res.status(500).send(err));
// };
// 
// exports.sortByDistrict = function (req, res) {
//     const sortDistrict = req.params.district || req.query.district || req.body.district;
// 
//     if (!sortDistrict) {
//         return res.status(400).end();
//     }
// 
//     Roadwork.find({
//         'dist': { $all: [sortDistrict] }
//     }).exec().then(rw => res.status(200).send(rw), err => res.status(500).send(err));
// };

const fullGeoJSON = (geo) => {
    return {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'properties': {},
                'geometry': geo
            }
        ]
    };
};

function findAll (req, res) {
    pg.connect(mapdbConString, function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        const query = `SELECT *, ST_AsGeoJSON(the_geom) as geojson FROM street_extras`;
        client.query(query, [], function (err, result) {
            //call `done()` to release the client back to the pool
            done();

            if (err) {
                return res.status(404).end();
            }

            const results = result.rows.map(d => {
                if (d.geojson) {
                    d.geojson = fullGeoJSON(JSON.parse(d.geojson));
                }

                return d;
            });

            return res.json(results);
            //12/3261/1924
        });
    });
};

function update (req, res) {
    const id = req.body.id;
    const geojson = req.body.geojson;
    pg.connect(mapdbConString, function (err, client, done) {
        if (err) {
            return console.error('error fetching client from pool', err);
        }
        const convertQuery = `SELECT ST_SetSRID(ST_MakeLine(ST_GeomFromGeoJSON(feat->>'geometry')),4326) as data
                            FROM (
                                SELECT json_array_elements($1::json->'features') AS feat
                            ) AS f;`;
        const query = `UPDATE street_extras
                        SET the_geom = $2
                        WHERE id=($1)`;
        client.query(convertQuery, [geojson], function (err, result) {
            //call `done()` to release the client back to the pool
            done();

            if (err) {
                return res.status(404).end();
            }

            const theGeom = result.rows[0].data;

            client.query(query, [id, theGeom], function (err) {
                if (err) {
                    return res.status(500).end();
                }

                return res.status(200).end();
            });
        });
    });
};

module.exports = {
    findAll,update
}