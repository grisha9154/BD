const express = require('express');
const app = express();
const handlebars = require('express-handlebars').create({defaultLayout:'main'});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.use(require('body-parser').urlencoded({ extended: true }));

const sql = require('mssql/msnodesqlv8');
sql.connect('Driver=SQL Server Native Client 11.0.2218.0;Server=DESKTOP-V9VK9A6\\SQLEXPRESS;Database=GameSurv;Trusted_Connection=yes;');

app.use(express.static('./public'));
app.set('port',process.env.PORT||3000);


app.get('/',allObject);
app.get('/ObjectById',ObjectById);
app.get('/allranchers',allRancher);
app.get('/DeleteRancherFromObject',async function (req, res) {
    let sql_req = new sql.Request();
    sql_req.input('rancherId',sql.Int,req.query.RancherId);
    await sql_req.execute('change_rancher_location',(err,result)=>{
        console.dir(result);
});
    await ObjectById(req,res);
});
app.get('/AddRancherToObject',allRancher);
app.get('/AddLocationRancher',async function (req,res) {
    let sql_req = new sql.Request();
    sql_req.input('rancherId',sql.Int,req.query.RancherId);
    sql_req.input('objectId',sql.Int,req.query.ObjectId);
    await sql_req.execute('change_rancher_location',(err,result)=>{
        console.dir(result);
});
    await ObjectById(req,res);
});
app.get('/RancherById',async function (req, res) {

});
app.get('/action',allAction);
app.get('/AddNewRancher', function (req,res) {
    res.render('createnewrancher');
});
app.get('/AddRancher',async function (req, res) {
    let sql_req = new sql.Request();
    sql_req.input('name',sql.NVarChar(100),req.query.RancherName);
    sql_req.input('userId',sql.Int,1);
    await sql_req.execute('create_rancher',(err,result)=>{
        console.dir(result);
    });
   await allRancher(req,res);
});
app.get('/OpenRancher',async function (req, res) {
    let inv = {MainGun:{},AltGun:{},SpecGun:{},Head:{},Hand:{},Body:{},Leg:{},Foot:{}};
    inv.MainGun =await  GetInvByRanchId(req.query.RancherId,'get_main_gun');
    inv.AltGun = await GetInvByRanchId(req.query.RancherId,'get_alt_gun');
    inv.SpecGun =await  GetInvByRanchId(req.query.RancherId,'get_spec_gun');
    inv.Head =await  GetInvByRanchId(req.query.RancherId,'get_head_armory');
    inv.Hand =await  GetInvByRanchId(req.query.RancherId,'get_hand_armory');
    inv.Body =await  GetInvByRanchId(req.query.RancherId,'get_body_armory');
    inv.Leg =await  GetInvByRanchId(req.query.RancherId,'get_leg_armory');
    inv.Foot = await GetInvByRanchId(req.query.RancherId,'get_foot_armory');
    await res.render('openRancher', inv);
});
app.get('/OpenAction',async function (req, res) {
    let sql_req = new sql.Request();
    await sql_req.execute('get_all_rancher_by_action_id',async (err,result)=>{
        console.dir(result);
        await result.recordset.forEach((item, i, arr)=>{
            item.location = req.query.location;
            if(req.query.action===undefined) {
                item.action = 'Open';
            }else{
                item.action =req.query.action ;
            }
        });
        await res.render('ActionById',{Rancher:result.recordset});
    });
});
app.get('/AddActivityRancher',async function (req, res) {
    let sql_req = new sql.Request();
    sql_req.input('rancherId',sql.Int,req.query.RancherId);
    sql_req.input('activityId',sql.Int,req.query.ActionId);
    await sql_req.execute('change_rancher_activity',(err,result)=>{
        console.dir(result);
    });
    await allAction(req,res);
});
app.get('/AddNewObjectInHome',async function (req, res) {
    let sql_req = new sql.Request();
    sql_req.input('userId',sql.Int,1);
    await sql_req.execute('get_all_object',(err,result)=>{
        console.dir(result);
        res.render('AddNewObjectInHome',{Object:result.recordset});
    });
});
app.get('/AddObject',async function (req, res) {
    let sql_req = new sql.Request();
    sql_req.input('homeId',sql.Int,req.query.homeId);
    sql_req.input('ObjectId',sql.Int,req.query.ObjectId);
    await sql_req.execute('insert_new_object_in_homestead',(err,result)=>{
        console.dir(result);
        allObject(req, res);
    });
});

app.get('/ChangeRancherMainGun',async function (req, res) {
    let sql_req = new sql.Request();
    let result = await sql_req.execute('');
});

app.get('/login',function (req, res) {
    res.render('login');
});
app.post('/login',function (req, res) {
    let body = req.body;
    let sql_req = new sql.Request();
    sql_req.input('user_login',sql.NVarChar(50),body.Username);
    sql_req.input('user_password',sql.NVarChar(100),body.Password);
    sql_req.execute('user_login',(err,res)=>{
        if(err){
            console.dir(err);
        }
        console.dir(res);

});
    res.render('home');
});

app.get('/registration',function (req, res) {
    res.render('registration');
});

app.post('/registration',async function (req, res) {
    let body = req.body;
    let sql_req = new sql.Request();
    sql_req.input('user_login',sql.NVarChar(50),body.Username);
    sql_req.input('user_password',sql.NVarChar(100),body.Password);
    sql_req.input('email',sql.NVarChar(50),body.Email);
    await sql_req.execute('create_user',(err,result)=>{
        console.dir(result);
        allObject(req,res)
    });
});

app.use(function(req,res){
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not found');
});

app.listen(app.get('port'),function () {
    console.log('Express is work');
});

async function allRancher (req, res) {
    let sql_req = new sql.Request();
    sql_req.input('user_id',sql.Int,1);
    await sql_req.execute('get_all_rancher',async (err,result)=>{
        console.dir(result);
    await result.recordset.forEach((item, i, arr)=>{
        item.location = req.query.location;
    if(req.query.action===undefined) {
        item.action = 'Open';
    }else{
        item.action =req.query.action ;
    }
});
    await res.render('AllRanchers',{Rancher:result.recordset});
});
}
async function ObjectById (req,res) {
    let sql_req = new sql.Request();
    sql_req.input('userid',sql.Int,1);
    sql_req.input('objectId',sql.Int,req.query.ObjectId);
    await sql_req.execute('get_rancher_by_object_id',(err,result)=>{
        console.dir(result);
    res.render('Object',{Rancher:result.recordset,location:req.query.ObjectId});
})
}
async function allAction (req, res) {
    let sql_req = new sql.Request();
    await sql_req.execute('get_all_action',(err,result)=>{
        console.dir(result);
        res.render('action',{Action:result.recordset});
    });
}
async function allObject (req, res) {
    let sql_req = new sql.Request();
    sql_req.input('user_id',sql.Int,1);
    await sql_req.execute('get_all_object_by_user_id',(err,result)=>{
        console.dir(result);
        res.render('home',{Object:result.recordset});
    });
}
async function GetInvByRanchId(rancherId,str) {
    let sql_req = new sql.Request();
    sql_req.input('rancherId',sql.Int,rancherId);
    let result = await sql_req.execute(str);
    return result.recordset[0];
}
