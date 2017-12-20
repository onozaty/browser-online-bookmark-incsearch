const ServiceId = {
  GOOGLE: 1,
  PINBOARD: 2,
  HATENA: 3
}

const Services = [
  {id: ServiceId.GOOGLE, name: 'Google Bookmarks', service: new GoogleService()},
  {id: ServiceId.PINBOARD, name: 'Pinboard', service: new PinboardService() },
  {id: ServiceId.HATENA, name: 'Hatena Bookmarks', service: new HatenaService()}
];
