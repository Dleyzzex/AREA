function handleError (err, req, res, next) {
    const { status, message } = err;

    if (err.name === 'UnauthorizedError')
      res.status(401).json({message: 'Unauthorized'});
    else if (status && message){
      res.status(status).json({
        message: message
      });
    }else if (err && typeof err == "string" && err.includes('Validation error')) {
      res.status(422).json({message: err});
    } else {
      console.log(err)
      return res.status(500).json({ message: (err.message) ? err.message : "Internal error."});
    }
  };

module.exports = handleError;