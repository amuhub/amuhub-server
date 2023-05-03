const NotificationTypeActionMapping = {
  post: {
    like: 'liked',
    comment: 'commented on',
  },
  question: {
    upvote: 'upvoted',
    downvote: 'downvoted',
    answer: 'answered',
  },
  answer: {
    upvote: 'upvoted',
    downvote: 'downvoted',
  },
  profile: {
    follow: 'started following',
  },
};

const NotificationTypes = {
  post: 'post',
  question: 'question',
  answer: 'answer',
  profile: 'profile',
};

module.exports = { NotificationTypeActionMapping, NotificationTypes };
