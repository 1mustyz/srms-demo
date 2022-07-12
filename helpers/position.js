
// function that give number value with ordinal that is st, nd, rd, th
const toOrdinal = n => {
  const ord = ['', 'ST', 'ND', 'RD'][('' + n).slice(-1)] // convert num to string & get ord char based on the last part of number for 1,2&3
  return !ord || n > 10 && n < 20 ? n + 'TH' : n + ord // give ordinal for number other than 1,2,3
}

// function to get position
exports.positionWithOrdinal = (data) => {
  return data.map((e, i) => {
    const prev = data[i - 1]
    if (i === 0) {
      e.position = toOrdinal(1)
    } else {
      e.position = e.average === prev.average ? toOrdinal(parseFloat(prev.position)) : toOrdinal(parseFloat(prev.position) + 1)
    }

    const studentIdentity = {
      id: e.id,
      position: e.position,
      username: e.username
    }
    return studentIdentity
  })
}

exports.positionWithoutOrdinal = (data) => {
  return data.map((e, i) => {
    const prev = data[i - 1]
    if (i === 0) {
      e.position = 1
    } else {
      e.position = e.total === prev.total ? parseFloat(prev.position) : parseFloat(prev.position) + 1
    }

    const studentIdentity = {
      id: e.id,
      position: e.position,
      username: e.username
    }
    return studentIdentity
  })
}
