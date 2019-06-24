// check if id is an integer
function comicsIDMmustBeInteger(req, res, next) {
    const id = req.params.id
    if (!Number.isInteger(parseInt(id))) {
        //console.error('Comics ID must be an integer');
        //res.status(400).redirect('/')
        res.status(400).json({ message: 'ID must be an integer' })
    } else {
        next()
    }
}

// check if id_issue is n integer or a float
function issueIDMustBeFloat(req, res, next) {
    const id = req.params.id_issue
    if (!Number.isInteger(parseInt(id))) {
        //console.error('Issue ID must be an integer');
        //res.status(400).redirect('/')
        res.status(400).json({ message: 'Issue ID must be an integer' })
    } else {
        next()
    }
}

// check before to continue if data. Using when we need to get the id
function checkFieldsPost(req, res, next) {
    // const { title, content, tags } = req.body
    const { _id, id, name, nb_issues, issues, image, publisher, start_year, date, active } = req.body

    //if (_id & id & name & nb_issues & issues & image & publisher & start_year & added & updated & active) {
    if (_id & id & name & nb_issues & issues & image & publisher & start_year & (date || (added & updated)) & active) {
        next()
    } else {
        console.error('fields are not good');
        res.status(400).redirect('/')
        //res.status(400).json({ message: 'fields are not good' })
    }
}

module.exports = {
    comicsIDMmustBeInteger,
    issueIDMustBeFloat,

    checkFieldsPost
}