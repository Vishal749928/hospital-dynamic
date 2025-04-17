var express = require("express");
var exe = require("./../connection");
var url = require("url"); 
var router = express.Router();


router.post("/save_appointment",async function(req,res){
    var d = req.body;
    var sql = `INSERT INTO appointment(patient_name,patient_mobile,appo_date,appo_time,patient_address,message)VALUES(?,?,?,?,?,?)`;
    var data = await exe (sql,[d.patient_name,d.patient_mobile,d.appo_date,d.appo_time,d.patient_address,d.message]) 
    // res.redirect()
    res.send("<script>location.href = document.referrer </script>");
})
// CREATE TABLE appointment(appo_id INT PRIMARY KEY AUTO_INCREMENT, patient_name VARCHAR(100), patient_mobile VARCHAR(15),appo_date TEXT,appo_time TEXT,patient_address TEXT,message TEXT)

router.get("/",async function(req,res){
    var tn = await exe(`SELECT * FROM top_nav`);
    var hs = await exe(`SELECT * FROM home_slider`);
    var hp = await exe(`SELECT * FROM happy_patient`);
    var ha = await exe(`SELECT * FROM home_about`);
    var Dr = await exe(`SELECT * FROM doctors`);
    var hb = await exe(`SELECT * FROM home_blog`);
    var appo = await exe(`SELECT * FROM appointment`);
    var obj = {"tn":tn[0],"hs":hs,"hp":hp[0],"ha":ha[0],"Dr":Dr,"hb":hb,"appo":appo[0]};
    res.render("user/index.ejs",obj)
})
router.get("/about",async function(req,res){
    var tn = await exe(`SELECT * FROM top_nav`);
    var appo = await exe(`SELECT * FROM appointment`);
    var obj = {"tn":tn[0], "appo":appo[0]}
    res.render("user/about page.ejs",obj)
})
router.get("/services",async function(req,res){
    var tn = await exe(`SELECT * FROM top_nav`);
    var appo = await exe(`SELECT * FROM appointment`);
    var services = await exe (`SELECT * FROM services`)

    var obj = {"tn":tn[0], "appo":appo[0],"services":services}
    res.render("user/services page.ejs",obj)
})

router.get("/gallery",async function(req,res){
    var tn = await exe(`SELECT * FROM top_nav`);
    var appo = await exe(`SELECT * FROM appointment`);
    var gall = await exe(`SELECT * FROM gallery`);
    var obj = {"tn":tn[0], "appo":appo[0], "gall":gall}
    res.render("user/gallery page.ejs",obj)
})
router.get("/contact",async function(req,res){
    var tn = await exe(`SELECT * FROM top_nav`);
    var appo = await exe(`SELECT * FROM appointment`);
    var obj = {"tn":tn[0], "appo":appo[0]}
    res.render("user/contact page.ejs",obj)
})
router.post("/save_contact",async function (req,res){
    var d = req.body;
    var sql = `INSERT INTO contact(full_name,email,mobile,message)VALUES(?,?,?,?)`;
    var data = await exe(sql,[d.full_name,d.email,d.mobile,d.message]);
    res.redirect("/contact");
    // res.send(data)
})
//CREATE TABLE contact(contact_id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(100),mobile VARCAR(15),message TEXT)
router.get("/faqs",async function(req,res){
    var tn = await exe(`SELECT * FROM top_nav`);
    var appo = await exe(`SELECT * FROM appointment`);
    var feed = await exe(`SELECT * FROM feedback`);
    var data = await exe(`SELECT * FROM faqs`);
    var obj = {"tn":tn[0], "appo":appo[0], "feed":feed, "data":data}
    res.render("user/faqs page.ejs",obj)
})
router.post("/save_feedback",async function(req,res){
    var d = req.body;
    var sql = `INSERT INTO feedback(name,review,rating)VALUES(?,?,?)`;
    var data = await exe(sql,[d.name,d.review,d.rating]);
    res.redirect("/faqs")
})

//CREATE TABLE feedback(feedback_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100),review VARCHAR(500),rating TEXT)
router.get("/appointment",function(req,res){
    res.render("user/appointment page.ejs")
})

module.exports = router;