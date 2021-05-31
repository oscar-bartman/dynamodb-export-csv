function parseKeyHeaderPairs (keyValuePairs) {
  return keyValuePairs.split(',').map(pair => {
    function splitPairs () {
      return pair.split('&')
    }

    return {
      key: splitPairs()[0].split('=')[1],
      ...(splitPairs()[1] ? { header: splitPairs()[1].split('=')[1] } : {})
    }
  })
}

module.exports = parseKeyHeaderPairs
