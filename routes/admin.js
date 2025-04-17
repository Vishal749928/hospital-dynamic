var express = require("express");
var exe = require("./../connection");
var url = require("url"); 
var router = express.Router();

function verify_login(req,res,next)
{
    if(req.session.admin_id)
        next();
    else
        res.send("<script>location.href = document.referrer+'?login_required'</script>");
}

// router.post("/save_account", async function(req,res){
//     var d = req.body;
//     var sql = `INSERT INTO admin_account(admin_name,admin_email,admin_password) VALUES (?,?,?)`;
//     var data = await exe(sql,[d.name, d.email, d.password]);
//     // res.send("<script>location.href = document.referrer </script>");
//     // res.send(data)
//     res.redirect("/admin/login")
// });

// router.get("/createaccount",function(req,res){
//     res.render("admin/createaccount.ejs")
// })


router.get("/", function(req,res){
    res.render("admin/login.ejs");
});

router.post("/proceed_login",async function(req,res){
    // res.send(req.body)
    var d = req.body;
    var sql = `SELECT * FROM admin_account WHERE admin_email = ? AND admin_password = ?`;
    var data = await exe(sql,[d.email, d.password]);
    if(data.length > 0)
        {
        var admin_id = data[0].admin_id;
        req.session.admin_id = admin_id;
        // res.send(`
        //     <script>
        //         var url = document.referrer;
        //         var new_url = url.replaceAll('?login_required','');
        //         location.href = new_url;
        //     </script>
        //     `);

          // Redirect back to the referrer or a default page
          let redirectUrl = req.get("/admin/")|| "index";
          redirectUrl = redirectUrl.replace("?login_required", ""); 
          // Remove login_required if present
  
          res.redirect(redirectUrl);
    }else
        res.send("login failed");
});

router.get("/logout",verify_login, function(req, res) {
    // Destroy the sessio
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
            res.send("Error logging out");
        } else {
            res.redirect("/admin"); 
        }
    });
});

router.get("/index",verify_login,async function(req,res){

    var today1 = new Date().toISOString().split("T")[0];

    var appo = await exe(`SELECT * FROM appointment WHERE appo_date >= '${today1}'`);
    var contact = await exe ("SELECT * FROM contact");
    var feedback = await exe ("SELECT * FROM feedback");
    var obj = {"appo":appo,"contact":contact, "feedback":feedback}
    res.render("admin/index.ejs",obj)
})
router.get("/appointment",verify_login,async function(req,res){
    var today1 = new Date().toISOString().split("T")[0];
    var appo = await exe(`SELECT * FROM appointment WHERE appo_date >= '${today1}'`);
    var appo_list = await exe(`SELECT * FROM appointment WHERE appo_date < '${today1}'`);
    var obj = {"appo":appo, "appo_list":appo_list}
    res.render("admin/appointment.ejs",obj)
})
router.get("/feedback",verify_login,async function (req,res){
    var feedback = await exe(`SELECT * FROM feedback`);
    var obj = {"feedback":feedback}
    res.render("admin/feedback.ejs",obj)
})
router.get("/feedback_delete/:id",async function(req,res){
    var id = req.params.id;
    var data = await exe (`SELECT * FROM feedback`)
    var sql = await exe (`DELETE FROM feedback WHERE feedback_id = '${id}'`);
    res.redirect("/admin/feedback")
})
router.get("/contact",verify_login,async function (req,res){
    var contact = await exe(`SELECT * FROM contact`);
    var obj = {"contact":contact}
    res.render("admin/contact.ejs",obj)
})


router.get("/navbar",verify_login,async function(req,res){
    var data = await exe (`SELECT * FROM top_nav`);
    var obj = {"data":data};
    res.render("admin/navbar_edit.ejs",obj);

});
router.post("/update_top_nav",async function(req,res){
    var d = req.body;
    var sql = `INSERT INTO top_nav(mobile, email, time, whatsapp, insta, youtube, facebook) VALUES(?,?,?,?,?,?,?)`;
    var data = await exe(sql,[d.mobile, d.email, d.time, d.whatsapp, d.insta, d.youtube, d.facebook]);
    // alert("update successfully")
    res.redirect("admin/top_nav.ejs")
})

// CREATE TABLE top_nav(id INT PRIMERY KEY AUTO_INCREMENT, mobile VARCHAR(15), email VARCHAR(100), time VARCHAR(20), whatsapp TEXT, insta TEXT, youtube TEXT, facebook TEXT)


router.get("/home_slider",verify_login,async function(req,res){
    var data = await exe(`SELECT * FROM home_slider`);
    var obj = {"data":data};
    res.render("admin/home slider.ejs",obj);
});
router.post("/update_home_slider",async function (req,res){
    if(req.files.slider_image1){
        slider_image1 = new Date().getTime()+req.files.slider_image1.name;
        req.files.slider_image1.mv("public/uploads/"+slider_image1);
    }
    var d = req.body;
    var sql = `INSERT INTO home_slider(slider_image1,slider_text1,slider_text2)VALUES(?,?,?)`;
    var data = await exe(sql,[slider_image1,d.slider_text1,d.slider_text2])
    res.redirect("/admin/home_slider")
    // res.send(data)
})
// CREATE TABLE home_slider(id INT PRIMARY KEY AUTO_INCREMENT,slider_image1 VARCHAR(200), slider_text1 VARCHAR(100), slider_image2 VARCHAR(200),slider_text2 VARCHAR(100),slider_image3 VARCHAR(200),slider_text3 VARCHAR(100),)
router.get("/edit_slider/:id",verify_login,async function(req,res){
    var id = req.params.id;
    var data = await exe(`SELECT * FROM home_slider WHERE slider_id = ${id}`);
    var obj = {"data":data[0]}
    res.render("admin/edit_slider.ejs",obj)
})
router.post("/save_edit_slider",async function(req,res){
    if(req.files.edit_slider_image1){
        edit_slider_image1 = new Date().getTime()+req.files.edit_slider_image1.name;
        req.files.edit_slider_image1.mv("public/uploads/"+edit_slider_image1);
    }
    var d = req.body;
    var sql = await exe(`UPDATE home_slider SET slider_image1 = '${edit_slider_image1}', slider_text1= '${d.edit_slider_text1}' ,slider_text2= '${d.edit_slider_text1}'  WHERE slider_id= '${d.slider_id}'`);
    res.redirect("/admin/home_slider")
    // res.send(d);
});
router.get("/delete_slider/:id",async function(req,res){
    var id = req.params.id;
    var sql = await exe(`SELECT * FROM home_slider`)
    var sql = await exe(`DELETE FROM home_slider WHERE slider_id = '${id}'`)
    res.redirect("/admin/home_slider")
})

router.get("/happy_patient",verify_login,async function(req,res){
    var data = await exe(`SELECT * FROM happy_patient`);
    var obj = {"data":data};
    res.render("admin/happy_patient.ejs",obj)
})
router.post("/update_happy_patient",async function(req,res){
    var d = req.body;
    var sql =  `INSERT INTO happy_patient(happy_patient, patient_visit, patient_likes)VALUES(?,?,?)`;
    var data = await exe (sql,[d.happy_patient, d.patient_visit, d.patient_likes]);
    res.redirect("/admin/happy_patient")
})
// CREATE TABLE happy_patient(id INT PRIMARY KEY AUTO_INCREMENT,happy_patient VARCHAR(10), patient_visit VARCHAR(10), patient_likes VARCHAR(10))


router.get("/home_About",verify_login,async function(req,res){

    var data = await exe(`SELECT * FROM home_About`);
    var obj = {"data":data};
    res.render("admin/home About.ejs",obj);
});
router.post("/update_home_About",async function (req,res){

    if(req.files.About_image1){
        About_image1 = new Date().getTime()+req.files.About_image1.name;
        req.files.About_image1.mv("public/uploads/"+About_image1);
    }
    if(req.files.About_image2){
    
        About_image2 = new Date().getTime()+req.files.About_image2.name;
        req.files.About_image2.mv("public/uploads/"+About_image2);
    }
    if(req.files.About_image3){
        About_image3 = new Date().getTime()+req.files.About_image3.name;
        req.files.About_image3.mv("public/uploads/"+About_image3);
    }

    var d = req.body;
    var sql = `INSERT INTO home_About(About_image1,About_text1,sub_heding1,About_image2,About_text2,sub_heding2,About_image3,About_text3.sub_heding3)VALUES(?,?,?,?,?,?,?,?,?)`;
    var data = await exe(sql,[About_image1,d.About_text1,d.sub_heding1,About_image2,d.About_text2,d.sub_heding3,About_image3,d.About_text3,d.sub_heding3])
    res.redirect("/admin/home_About")
    // res.send(data)
});
// CREATE TABLE home_About(id INT PRIMARY KEY AUTO_INCREMENT,About_image1 VARCHAR(200), About_text1 VARCHAR(100), About_image2 VARCHAR(200),About_text2 VARCHAR(100),About_image3 VARCHAR(200),About_text3 VARCHAR(100),)


router.get("/home_Doctors",verify_login,async function(req,res){

    var data = await exe(`SELECT * FROM doctors`);
    var obj = {"data":data};
    res.render("admin/doctors.ejs",obj);
});
router.post("/update_home_Doctors",async function (req,res){

    if(req.files.Doctors_image1){
        Doctors_image1 = new Date().getTime()+req.files.Doctors_image1.name;
        req.files.Doctors_image1.mv("public/uploads/"+Doctors_image1);
    }

    var d = req.body;
    var sql = `INSERT INTO doctors(Doctors_image1,Doctors_info1,Doctors_info2,Doctors_info3)VALUES(?,?,?,?)`;
    var data = await exe(sql,[Doctors_image1,d.Doctors_info1,d.Doctors_info2,d.Doctors_info3])
    res.redirect("/admin/home_Doctors")
    // res.send(data)
});
// CREATE TABLE doctors(id INT PRIMARY KEY AUTO_INCREMENT,Doctors_image1 VARCHAR(200), Doctors_info1 VARCHAR(100), Doctors_image2 VARCHAR(200),Doctors_info2 VARCHAR(100),Doctors_image3 VARCHAR(200),Doctors_info3 VARCHAR(100),)
router.get("/delete_Doctors/:id",async function(req,res){
    var id = req.params.id;
    var data = await exe(`SELECT * FROM doctors`)
    var sql = await exe(`DELETE FROM doctors WHERE doctor_id = ${id};`);

    res.redirect("/admin/home_Doctors")
})
router.get("/edit_Doctors/:id",verify_login,async function(req,res){
    var id = req.params.id;
    var data =await exe (`SELECT * FROM doctors WHERE doctor_id = "${id}"`);
    var obj = {"data":data[0]}
    res.render("admin/edit_Doctors.ejs",obj)
})
router.post("/save_edit_Doctors",async function (req,res){
    if(req.files.edit_Doctors_image1){
        edit_Doctors_image1 = new Date().getTime()+req.files.edit_Doctors_image1.name;
        req.files.edit_Doctors_image1.mv("public/uploads/"+edit_Doctors_image1);
    }
    var d = req.body;
    var sql = `UPDATE doctors SET Doctors_image1 = ?, Doctors_info1 = ?, Doctors_info2 = ?, Doctors_info3 = ? WHERE doctor_id = ? `;
    var data = await exe (sql,[edit_Doctors_image1, d.edit_Doctors_info1, d.edit_Doctors_info2, d.edit_Doctors_info3, d.doctor_id])

    res.redirect("/admin/home_Doctors")
});

router.get("/blog",verify_login,async function(req,res){
    var sql = await exe(`SELECT * FROM home_blog`);
    var obj = {"data":sql}
    res.render("admin/home_blog.ejs",obj);
});
router.post("/save_blog",async function (req,res){
    if(req.files.blog_image){
        blog_image = new Date().getTime()+req.files.blog_image.name;
        req.files.blog_image.mv("public/uploads/"+blog_image);
    }
    var d = req.body;
    var sql = await exe(`INSERT INTO home_blog(blog_image,blog_info )VALUES('${blog_image}','${d.blog_info}')`);
    res.redirect("/admin/blog");
});
// CREATE TABLE home_blog(blog_id INT PRIMARY KEY AUTO_INCREMENT, blog_image VARCHAR(200), blog_info TEXT)


router.get("/edit_blog/:id",verify_login,async function(req,res){
    var id = req.params.id;
    var sql = await exe(`SELECT * FROM home_blog WHERE blog_id= '${id}'`);
    var obj = {"data":sql[0]}
    res.render("admin/edit_home_blog.ejs",obj);
});
router.post("/save_edit_blog",async function (req,res){
    if(req.files.edit_blog_image){
        edit_blog_image = new Date().getTime()+req.files.edit_blog_image.name;
        req.files.edit_blog_image.mv("public/uploads/"+edit_blog_image);
    }
    var d = req.body;
    var sql = await exe(`UPDATE home_blog SET blog_image = '${edit_blog_image}', blog_info ='${d.edit_blog_info}' WHERE blog_id = '${d.blog_id}'`);
    res.redirect("/admin/blog");
});
router.get("/delete_blog/:id",async function(req,res){
    var id = req.params.id;
    var sql = await exe(`SELECT * FROM home_blog`);
    var sql = await exe (`DELETE FROM home_blog WHERE blog_id = '${id}'`)
    res.redirect("/admin/blog");
});
router.get("/about",verify_login,async function(req,res){
    var data = await exe(`SELECT * FROM about_page`)
    var obj = {"data":data};
    res.render("admin/about.ejs",obj);
});

router.post("/save_about",async function (req,res){
    if(req.files.about_image1){
        about_image1 = new Date().getTime()+req.files.about_image1.name;
        req.files.about_image1.mv("public/uploads/"+about_image1);
    }
    var d = req.body;
    var sql = `INSERT INTO about_page (about_image1,heading_1,description_1,heading_2,description_2)VALUES(?,?,?,?,?)`;
    var data = await exe(sql,[about_image1,d.heading_1,d.description_1,d.heading_2,d.description_2]);
    res.redirect("/admin/about");
});

// CREATE TABLE about_page(about_id INT PRIMARY KEY AUTO_INCREMENT,about_image1 VARCHAR(200),heading_1 VARCHAR(100), description_1 VARCHAR(200),heading_2 VARCHAR(100),description_2 VARCHAR(200))

router.get("/edit_about/:id",verify_login,async function(req,res){
    var id = req.params.id;
    var data = await exe(``)
})



router.get("/services",verify_login,async function(req,res){
    var data = await exe (`SELECT * FROM services`)
    var obj = {"data":data}
    res.render("admin/services.ejs",obj);
});
router.post("/save_services",async function(req,res){
    if(req.files.services_image){
        services_image = new Date().getTime()+req.files.services_image.name;
        req.files.services_image.mv("public/uploads/"+services_image);
    }
    var d = req.body;
    var sql = `INSERT INTO services(services_image,heading,information)VALUES(?,?,?)`;
    var data = await exe(sql,[services_image,d.heading,d.information]);
    res.redirect("/admin/services"); 
});

// CREATE TABLE services(services_id INT PRIMARY KEY AUTO_INCREMENT, services_image VARCHAR(200), heading VARCHAR(100), information TEXT)

router.get("/gallery",verify_login,async function(req,res){
    var data = await exe(`SELECT * FROM gallery`);
    var obj = {"data":data};
    res.render("admin/gallery.ejs",obj);
});

router.post("/save_gallery",async function(req,res){
    if(req.files.gallery_image){
        gallery_image = new Date().getTime()+req.files.gallery_image.name;
        req.files.gallery_image.mv("public/uploads/"+gallery_image);
    }
    var d = req.body;
    var sql = `INSERT INTO gallery (gallery_image)VALUES(?)`
    var data = await exe(sql,[gallery_image]);
    res.redirect("/admin/gallery");
})
router.get("/gallery_delete/:id",async function(req,res){
   var id = req.params.id ;
   var sql = await exe (`SELECT * FROM gallery`);
   var sql = await exe (`DELETE FROM gallery WHERE gallery_id = '${id}'`);
   res.redirect("/admin/gallery")
})
router.get("/faqs",verify_login,async function(req,res){
    var data = await exe (`SELECT * FROM faqs`);
    var obj = {"data":data}
    res.render("admin/faqs.ejs",obj);
});
router.post("/save_faqs",async function(req,res){
    var d = req.body ;
    var sql = `INSERT INTO faqs(que,ans)VALUES(?,?)`;
    var data = await exe(sql,[d.que,d.ans]);
    res.redirect("/admin/faqs");
})

//CREATE TABLE faqs (faqs_id INT PRIMERY KEY AUTO_INCREMENT, que VARCHAR(500), ans VARCHAR(500))
module.exports = router;

