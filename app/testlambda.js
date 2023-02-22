exports.main = async function(event, context) {
    console.log(JSON.stringify(event))
    return {
        statusCode : 200
    }
}