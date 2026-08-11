export class NotificationSearchOption{

    userProfielId :string;
    pageIndex :number;
    pageSize :number;
    type :string  // ['None'; 'Email'; 'System'; 'Push'; 'Sms'];
    status :string  // ['UnRead'; 'Read'; 'All'];
    afterDate :string;
}