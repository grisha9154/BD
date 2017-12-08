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


app.get('/',async function  (req, res) {
    let sql_req = new sql.Request();
    sql_req.input('user_id',sql.Int,1);
    await sql_req.execute('get_all_object',(err,result)=>{
        console.dir(result);
    res.render('home',{Object:result.recordset});
});
});
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
app.get('/action',async function (req, res) {
    let sql_req = new sql.Request();
    await sql_req.execute('get_all_action',(err,result)=>{
        console.dir(result);
    res.render('action',{Action:result.recordset});
});
});
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

app.post('/registration',function (req, res) {
    let body = req.body;
    let sql_req = new sql.Request();
    sql_req.input('user_login',sql.NVarChar(50),body.Username);
    sql_req.input('user_password',sql.NVarChar(100),body.Password);
    sql_req.input('email',sql.NVarChar(50),body.Email);
    sql_req.execute('create_user',(err,res)=>{
        console.dir(res);
});
    res.render('home',{name:'Grisha'});
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