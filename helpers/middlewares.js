// check before to continue if the id is an integer. Using when we need to get the id
function mustBeInteger(req, res, next) {
    const id = req.params.id

    if (!Number.isInteger(parseInt(id))) {
        console.error('ID must be an integer');
        res.status(400).redirect('/')
        //res.status(400).json({ message: 'ID must be an integer' })
    } else {
        next()
    }
}

// check before to continue if data. Using when we need to get the id
function checkFieldsPost(req, res, next) {
    // const { title, content, tags } = req.body
    const { id, name, nb_issues, issues, image, publisher, start_year, added, updated, active } = req.body

    if (id & name & nb_issues & issues & image & publisher & start_year & added & updated & active) {
        next()
    } else {
        console.error('fields are not good');
        res.status(400).redirect('/')
        //res.status(400).json({ message: 'fields are not good' })
    }
}

module.exports = {
    mustBeInteger,
    checkFieldsPost
}