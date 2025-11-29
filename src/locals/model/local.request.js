export class LocalRequest {
  constructor({
    localName,
    descriptionMessage,
    country,
    city,
    district,
    street,
    latitude,
    longitude,
    price,
    capacity,
    photoUrls,
    features,
    localCategoryId,
    userId
  }) {
    this.localName = localName;
    this.descriptionMessage = descriptionMessage;
    this.country = country;
    this.city = city;
    this.district = district;
    this.street = street;
    this.latitude = latitude ? parseFloat(latitude) : null;
    this.longitude = longitude ? parseFloat(longitude) : null;
    this.price = parseFloat(price);
    this.capacity = parseInt(capacity);
    this.photoUrls = photoUrls;
    this.features = features.join(',');
    this.localCategoryId = localCategoryId;
    this.userId = userId;

  }
}