export class Notifications {
    type :string;; // ['None', 'Email', 'System', 'Push', 'Sms']
    state :string;; // ['Pending', 'Sent', 'Failed']
    sender :string;
    recipients :string[];
    subject :string;
    body :string;
    isRead :boolean;
    deleted :boolean;
    directLink :string;
    id :string;
    created :string;
    modified :string;
    createdBy :string;
    modifiedBy :string;
}