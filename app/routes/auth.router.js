const flash = require('connect-flash');
const passport = require('passport');
const { Router } = require('express');


const attach = (app, data) => {
    const router = new Router();

    router
        .post('/signup', (req, res) => {
            const user = req.body;

            user.posts = [];

            return data.users.create(user)
                    .then((dbItem) => {
                        console.log(dbItem);
                        res.redirect('/login');
                    });
        })

        .post('/login',
            passport.authenticate('local', {
                failureRedirect: '/login',
                failureFlash: true,
        }), (req, res) => {
            res.redirect(`/dashboard/${req.user._id}`);
        })

        .get('/dashboard/:id', (req, res) => {
            if (!req.isAuthenticated()) {
                return res.redirect('/401');
            }
            const user = req.user;

            return res.render('dashboard', {
                user: user,
            });
        })

        .get('/editor', (req, res) => {
            if (!req.isAuthenticated()) {
                return res.redirect('/401');
            }
            const user = req.user;

            return res.render('editor', {
                user: user,
            });
        })

        .get('/logout', (req, res) => {
            if (!req.isAuthenticated()) {
                return res.redirect('/401');
            }
            req.logout();
            return res.redirect('/login');
        })

        .post('/edit', (req, res) => {
            const post = req.body;
            const userId = req.session.passport.user;
            const file = req.files.file;
            const currentDate = new Date;
            const month = [];
            month[0] = 'January';
            month[1] = 'February';
            month[2] = 'March';
            month[3] = 'April';
            month[4] = 'May';
            month[5] = 'June';
            month[6] = 'July';
            month[7] = 'August';
            month[8] = 'September';
            month[9] = 'October';
            month[10] = 'November';
            month[11] = 'December';
            const date = `${month[currentDate.getMonth()]} 
                        ${currentDate.getDate()}, 
                        ${currentDate.getFullYear()}`;
            file.mv('./static/images/' + file.name);
            return data.users.findById(userId)
                .then((user) => {
                    post.author = user.username;
                    post.content = post.content.split('\r\n');
                    post.tags = post.tags.split(', ');
                    post.url = '/static/images/' + file.name;
                    post.date = date;

                    return data.posts.create(post)
                        .then((dbItem) => {
                            console.log(dbItem.ops[0].category);
                            return data.categories
                                .findByName(dbItem.ops[0].category)
                                .then((category) => {
                                    if (!category) {
                                        const cat = {};
                                        cat.name = dbItem.ops[0].category;

                                        return data.categories.create(cat)
                                            .then((c) => {
                                                console.log(c);
                                                return res.redirect('/editor');
                                            });
                                    }
                                    console.log(category);
                                    return res.redirect('/editor');
                                });
                        });
                });
        });

    app.use(flash());
    app.use('/', router);
};

module.exports = attach;
