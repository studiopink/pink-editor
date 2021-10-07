module.exports = {
    port: process.env.PORT,
    domain: process.env.DOMAIN,
    production: process.env.NODE_ENV == 'production'
};