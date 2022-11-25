
const verifyLogin = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        console.log("url:",req.originalUrl);
        req.session.redirectUrl=req.originalUrl
    
        res.redirect('/login')
    }
}

module.exports = { verifyLogin }