const { ObjectId } = require('mongodb');
const Log = require('../../models/Log');
const User = require('../../models/User')

async function normalize_follows_logs() {
  const logs = await Log.find({ message: { $regex: 'followed|unfollowed', $options: 'i' } });

  console.log(`Found ${logs.length} logs`);

  for (let log of logs) {
    // --- Создаём новый чистый объект data ---
    const newData = {};

    if (log.data) {
      if (log.data.follower) newData.follower = new ObjectId(log.data.follower._id);
      if (log.data.followed) newData.followed = new ObjectId(log.data.followed._id);
    }

    log.data = newData; // заменяем полностью data на чистый объект

    // --- Устанавливаем type ---
    if (!log.type) {
      if (log.message.toLowerCase().includes('unfollowed')) {
        log.type = 'unfollow';
      } else if (log.message.toLowerCase().includes('followed')) {
        log.type = 'follow';
      }
    }

    await log.save();
  }

  console.log(`Normalized ${logs.length} logs`);
}

async function normalizeCreatePostLogs() {
  const logs = await Log.find({ message: { $regex: 'created post', $options: 'i' } });
  console.log(`Found ${logs.length} create_post logs`);

  for (let log of logs) {
    if (log.data) {
      const newData = {};

      // --- user = ObjectId автора поста ---
      if (log.data.post && log.data.post.author) {
        newData.user = new ObjectId(log.data.post.author);
      }

      // --- post = ObjectId самого поста ---
      if (log.data.post && log.data.post._id) {
        newData.post = new ObjectId(log.data.post._id);
      }

      log.data = newData; // полностью заменяем data

      // --- type ---
      log.type = 'create_post';

      await log.save();
    }
  }

  console.log(`Normalized ${logs.length} create_post logs`);
}

async function normalizeCreatePostLogsNames() {
    // Находим все логи create_post
    const logs = await Log.find({ type: 'create_post' });
    console.log(`Found ${logs.length} create_post logs to normalize`);

    for (let log of logs) {
        if (log.data && log.data.user) {
            // Берем user id
            const userId = log.data.user;

            // Находим ник по id
            const user = await User.findById(userId).select('nick_name');
            if (!user) continue;

            // Обновляем message
            log.message = `User ${user.nick_name} created post`;

            await log.save();
        }
    }

    console.log(`Normalized ${logs.length} create_post logs`);
}


async function normalizeSaveUnsavePostLogs() {
  // Берём все логи, где message содержит "saved post" или "unsave post" и нет поля type
  const logs = await Log.find({ 
    message: { $regex: '(saved post|unsave post)', $options: 'i' }, 
    type: { $exists: false } 
  });

  console.log(`Found ${logs.length} save/unsave post logs to normalize`);

  for (let log of logs) {
    if (log.data) {
      const newData = {};

      // --- user = ObjectId пользователя ---
      if (log.data.user && log.data.user._id) {
        newData.user = new ObjectId(log.data.user._id);
      }

      // --- post = ObjectId поста ---
      if (log.data.post && log.data.post._id) {
        newData.post = new ObjectId(log.data.post._id);
      }

      log.data = newData; // полностью заменяем data

      // --- type ---
      if (/saved post/i.test(log.message)) {
        log.type = 'save_post';
      } else if (/unsave post/i.test(log.message)) {
        log.type = 'unsave_post';
      }

      await log.save();
    }
  }

  console.log(`Normalized ${logs.length} save/unsave post logs`);
}

async function normalizeLoginedLogs() {
  // Находим все логи с "logined" в message и без type
  const logs = await Log.find({ message: { $regex: 'logined', $options: 'i' }, type: { $exists: false } });
  console.log(`Found ${logs.length} logined logs to normalize`);

  for (let log of logs) {
    if (log.data && log.data.user && log.data.user._id) {
      log.data = {
        user: new ObjectId(log.data.user._id)
      };
      log.type = 'login'; // Добавляем поле type
      await log.save();
    }
  }

  console.log(`Normalized ${logs.length} logined logs`);
}

async function normalizeDeletePostLogs() {
  const logs = await Log.find({ message: { $regex: 'deleted post', $options: 'i' } });
  console.log(`Found ${logs.length} delete_post logs to normalize`);

  for (let log of logs) {
    if (log.data) {
      // Полностью создаём новый объект data с ObjectId
      const newData = {};

      if (log.data.user && log.data.user._id) {
        newData.user = new ObjectId(log.data.user._id);
      }

      if (log.data.post && log.data.post._id) {
        newData.post = new ObjectId(log.data.post._id);
      }

      log.data = newData; // заменяем полностью data
      log.type = 'delete_post';

      await log.save();
    }
  }

  console.log(`Normalized ${logs.length} delete_post logs`);
}

async function normalizeLoginLogs() {
    // Находим все логи типа 'login'
    const logs = await Log.find({ type: 'login' });

    console.log(`Found ${logs.length} login logs to normalize`);

    for (let log of logs) {
        if (log.data && log.data.user) {
            // Ищем пользователя по id
            const user = await User.findOne({ _id: log.data.user });
            
            if (user) {
                log.message = `User ${user.nick_name} logged in`;
                await log.save();
            } else {
                console.log(`User not found for log ${log._id}`);
            }
        }
    }

    console.log(`Normalized ${logs.length} login logs`);
}

module.exports = { normalizeLoginLogs };

