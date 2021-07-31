//check if user is logged in && the user is not trying to access unauthorised data
exports.isStaffLoggedIn = function (role) {
    return (req, res, next) => {
      if (req.isAuthenticated() && (req.user.role.includes(role) 
      || req.user.role.includes('Admin'))) {
        return res.json({ success: true, message: 'valid staff', user: req.user })
      }else{
      res.json({ success: false, message: 'unauthorized or authenticated staff', user: req.user})
    }
  }
  }

//check if user is logged in && the user is not trying to access unauthorised data
exports.isStudentLoggedIn = function (role) {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.userType === 'student') {
      return res.json({ success: true, message: 'student success', user: req.user })
    }else{
    res.json({ success: false, message: 'unauthorized or authenticated student', user: req.user})
  }
}
}