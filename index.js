class ArgumentError extends Error {}

function transformHotel (hotel) {
  if (!hotel.name) {
    throw new ArgumentError('hotel name must not be empty')
  } else if (hotel.name.length < 5) {
    throw new ArgumentError('hotel name too short')
  } else if (hotel.name.length > 64) {
    throw new ArgumentError('hotel name too large')
  }

  var newHotel = {
    primaryName: hotel.name,
    description: hotel.description,
    rooms: hotel.rooms,
    features: []
  }

  if (hotel.features) {
    Object.keys(hotel.features).forEach(feature => {
      newHotel.features.push({
        name: feature,
        value: `${hotel.features[feature]}`
      })
    })
  }

  return newHotel
}

module.exports = {
  ArgumentError,
  transformHotel
}
