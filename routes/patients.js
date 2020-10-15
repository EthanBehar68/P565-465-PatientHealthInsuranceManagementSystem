var express = require("express"),
    router = express.Router(),
    empty = require('is-empty'),
    moment = require('moment'),
    mail = require('../utils/mail'),
    { doQuery, sql } = require('../db');

// Get's patientUser and patientMedicalData
router.get('/:id', function(req, res) {
  // VALIDATION GOES HERE
  // since this gives back valid medical data we need a valid JWT 
  // HIPAA SHIT
  let query = `SELECT *, (SELECT * FROM patientMedicalData WHERE patientUsers.id = patientMedicalData.id FOR JSON PATH) AS detail FROM patientUsers WHERE id = ${req.params.id};`;
  let params = [];
  doQuery(res, query, params, function(selectData) {
    if (empty(selectData.recordset)) res.status(400).send({ error: "Patient record does not exist." })
    
    delete selectData.recordset[0].pword

    res.send({ ...selectData.recordset.map(item => ({ ...item, detail: empty(JSON.parse(item.detail)) ? {} : JSON.parse(item.detail)[0]}))[0], userType: 'patient' });
  });
});


//#region creating/updating patient medical data

// Creates patientMedicalData record for patientUser
router.post('/onboard', function(req, res) {
  // VALIDATION GOES HERE

  let query = `INSERT INTO patientMedicalData (id, address1, address2, state1, city, zipcode, birthdate, sex, height, weight1, bloodtype, smoke, smokefreq, drink, drinkfreq, caffeine, caffeinefreq) 
               OUTPUT INSERTED.* 
               VALUES (@id, @address1, @address2, @state1, @city, @zipcode, @birthdate, @sex, @height, @weight1, @bloodtype, @smoke, @smokefreq, @drink, @drinkfreq, @caffeine, @caffeinefreq);`;
  let params = [
    { name: 'id', sqltype: sql.Int, value: req.body.id },
    { name: 'address1', sqltype: sql.VarChar(255), value: req.body.address1 },
    { name: 'address2', sqltype: sql.VarChar(255), value: req.body.address2 },
    { name: 'state1', sqltype: sql.VarChar(15), value: req.body.state1 },
    { name: 'city', sqltype: sql.VarChar(50), value: req.body.city },
    { name: 'zipcode', sqltype: sql.VarChar(15), value: req.body.zipcode },
    { name: 'birthdate', sqltype: sql.VarChar(15), value: req.body.birthdate },
    { name: 'sex', sqltype: sql.VarChar(10), value: req.body.sex },
    { name: 'height', sqltype: sql.VarChar(10), value: req.body.height },
    { name: 'weight1', sqltype: sql.VarChar(10), value: req.body.weight1 },
    { name: 'bloodtype', sqltype: sql.VarChar(5), value: req.body.bloodtype },
    { name: 'smoke', sqltype: sql.Bit, value: req.body.smoke },
    { name: 'smokefreq', sqltype: sql.Int, value: req.body.smokefreq },
    { name: 'drink', sqltype: sql.Bit, value: req.body.drink },
    { name: 'drinkfreq', sqltype: sql.Int, value: req.body.drinkfreq },
    { name: 'caffeine', sqltype: sql.Bit, value: req.body.caffeine },
    { name: 'caffeinefreq', sqltype: sql.Int, value: req.body.caffeinefreq }
  ];

  doQuery(res, query, params, function(insertData) {
    if (empty(insertData.recordset)) res.status(400).send({ error: "Data not saved." })
    
    res.send({ detail: insertData.recordset[0] });
  });
});

// Updates patientMedicalData record for patientUser
router.put('/detail', function(req, res) {
  // VALIDATION GOES HERE
  
  let query = `UPDATE patientMedicalData SET address1 = @address1, address2 = @address2, state1 = @state1, city = @city, zipcode = @zipcode, birthdate = @birthdate, 
               sex = @sex, height = @height, weight1 = @weight1, bloodtype = @bloodtype, smoke = @smoke, smokefreq = @smokefreq, drink = @drink, 
               drinkfreq = @drinkfreq, caffeine = @caffeine, caffeinefreq = @caffeinefreq OUTPUT INSERTED.* WHERE id = @id;`;
  let params = [
    { name: 'id', sqltype: sql.Int, value: req.body.id },
    { name: 'address1', sqltype: sql.VarChar(255), value: req.body.address1 },
    { name: 'address2', sqltype: sql.VarChar(255), value: req.body.address2 },
    { name: 'state1', sqltype: sql.VarChar(15), value: req.body.state1 },
    { name: 'city', sqltype: sql.VarChar(15), value: req.body.city },
    { name: 'zipcode', sqltype: sql.VarChar(15), value: req.body.zipcode },
    { name: 'birthdate', sqltype: sql.VarChar(15), value: req.body.birthdate },
    { name: 'sex', sqltype: sql.VarChar(10), value: req.body.sex },
    { name: 'height', sqltype: sql.VarChar(10), value: req.body.height },
    { name: 'weight1', sqltype: sql.VarChar(10), value: req.body.weight1 },
    { name: 'bloodtype', sqltype: sql.VarChar(5), value: req.body.bloodtype },
    { name: 'smoke', sqltype: sql.Bit, value: req.body.smoke },
    { name: 'smokefreq', sqltype: sql.Int, value: req.body.smokefreq },
    { name: 'drink', sqltype: sql.Bit, value: req.body.drink },
    { name: 'drinkfreq', sqltype: sql.Int, value: req.body.drinkfreq },
    { name: 'caffeine', sqltype: sql.Bit, value: req.body.caffeine },
    { name: 'caffeinefreq', sqltype: sql.Int, value: req.body.caffeinefreq }
  ];

  doQuery(res, query, params, function(data) {
    if(empty(data.recordset)) res.status(400).send({ error: "Record update failed." })
    
    res.send({ detail: data.recordset[0] });
  });
});

//#endregion

module.exports = router;