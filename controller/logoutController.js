exports.logout = (req, res, next) => {
  req.logout()
  //redirect to login page
  res.json({ success: true, message: 'logged out succesful' })
}