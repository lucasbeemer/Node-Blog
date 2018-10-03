const express = require('express');
const userDb = require('./data/helpers/userDb.js');
const postDb = require('./data/helpers/postDb.js');
const server = express();
const port = 9000;
const cors = require('cors');
const helmet = require('helmet');
const logger = require('morgan');

server.use(cors());
server.use(helmet());
server.use(logger('combined'));
server.use(express.json());

const upperCase = (req, res, next) => {
    req.name = req.body.name.toUpperCase();
    console.log(req.name);
    next();
};

server.get('/', (req, res) => {
	res.send('<h2>Server is running.</h2>');
})

server.get('/api/users', (req, res) => {
    userDb
    .get()
    .then(user => {
        res.status(200).json(user);
    })
    .catch(() => {
        res.status(500).json({ error: 'Could not load users.'});
    });
});

server.get('/api/users/:id', (req, res) => {
    const {id} = req.params;
        userDb
         .get(id)
         .then(user => {
             res.status(200).json(user);
         })
         .catch(() => {
             res.status(500).json({ error: 'Could not load users.'});
         });
});

server.post('/api/users', upperCase, (req, res) => {
    const name = req.name;
    if (!name) {
      res.status(400).json({ error: 'No name provided.' });
    } else {
      const newUser = { name };
      userDb
        .insert(newUser)
        .then(userId => {
          userDb
            .get(userId)
            .then(user => {
              res.status(200).json(user);
            })
            .catch(() => {
              res.status(500).json({ error: 'Could not load user.' });
            });
        })
        .catch(() => {
          res
            .status(500)
            .json({ error: 'There was an error while adding the user' });
        });
    }
  });
  
  server.put('/api/users/:id', upperCase, (req, res) => {
    const { id } = req.params;
    const name = req.name;
    if (!name) {
      res.status(400).json({ error: 'Please provide a name for the user.' });
    } else if (!id) {
      res.status(500).json({ error: `Could not find user with id of ${id}.` });
    } else {
      const thisUser = { name };
      userDb
        .update(id, thisUser)
        .then(isUpdated => {
          if (isUpdated !== 1) {
            res.status(500).json({ error: 'User could not be updated.' });
          } else {
            userDb
              .get(id)
              .then(user => {
                res.status(200).json(user);
              })
              .catch(() => {
                res.status(404).json({ error: 'Could not load user.' });
              });
          }
        })
        .catch(() => {
          res.status(404).json({ error: 'Could not update user.' });
        });
    }
  });
  
  server.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(500).json({ error: 'Could not delete, id not found' });
    } else {
      const deletedUser = userDb
        .get(id)
        .then(user => {
          return user[0];
        })
        .catch(() => {
          res.status(404).json({ error: `Error finding user with id of ${id}` });
        });
      userDb
        .remove(id)
        .then(removedUser => {
          if (!removedUser) {
            res.status(500).json({ error: 'This user could not be deleted.' });
          } else {
            res.status(200).json(deletedUser._rejectionHandler0);
          }
        })
        .catch();
    }
  });
  
  server.listen(9000, () => console.log(`SERVER RUNNING ON ${port}`));