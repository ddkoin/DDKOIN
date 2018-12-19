let crypto = require('crypto');
let ed = require('./ed.js');
var async = require('async');
let slots = require('./slots');
let Logger = require('../logger.js');
let logman = new Logger();
let logger = logman.logger;
let sql = require('../sql/referal_sql');
let transactionLog = require('../logic/transaction');
let transactionMod = require('../modules/transactions');
let transactionTypes = require('./transactionTypes');
let accounts = require('../modules/accounts');

let self;

// Constructor
exports.newMigrationProcess = function (scope) {
    this.scope = {
        balancesSequence: scope.balancesSequence,
        db: scope.db,
        dbReplica: scope.dbReplica,
        config: scope.config
    };
    self = this;
    etpsNewsMigrationProcess()
}

/**
 * Send Transaction for Liquid balance and Frozen Amount Distribution.
 * @param {user_data} - Contains the address, Send Amount of Etps user.
 * @param {cb} - callback function which will return the status.
 */

function SendTrs(user_data, cb) {
    self.scope.balancesSequence.add(function (cb3) {

        let sender_hash = Buffer.from(JSON.parse(self.scope.config.users[8].keys));
        let sender_keypair = ed.makeKeypair(sender_hash);
        let sender_publicKey = sender_keypair.publicKey.toString('hex');

        accounts.prototype.setAccountAndGet({
            publicKey: sender_publicKey
        }, function (err, account) {
            if (err) {
                return setImmediate(cb, err);
            }

            let secondKeypair = null;

            let transaction;

            try {
                transaction = transactionLog.prototype.create({
                    type: (transactionTypes.SEND),
                    amount: user_data.balance,
                    sender: account,
                    recipientId: user_data.address,
                    keypair: sender_keypair,
                    secondKeypair: secondKeypair,
                    trsName: 'SEND_MIGRATION'
                });
            } catch (e) {
                return setImmediate(cb, e.toString());
            }

            transactionMod.prototype.receiveTransactions([transaction], true, cb3);
        });
    }, function (err, transaction) {
        if (err) {
            return setImmediate(cb, err);
        }
        cb();
    });
}

/**
 * Migration Type Transaction for Frozen Amount Distribution.
 * @param {user_data} - Contains the address, passphrase, publicKey, frozed amount of Etps user.
 * @param {cb} - callback function which will return the status.
 */


function MigrationTrs(user_data, cb) {

    let etpsSecret = Buffer.from(user_data.passphrase, "base64").toString("ascii");

    let etphash = crypto.createHash('sha256').update(etpsSecret, 'utf8').digest();

    let etpskeypair = ed.makeKeypair(etphash);

    let etps_account = {
        address: user_data.address,
        publicKey: user_data.publicKey
    };

    self.scope.balancesSequence.add(function (cb4) {
        let transaction;

        try {
            transaction = transactionLog.prototype.create({
                type: transactionTypes.MIGRATION,
                amount: user_data.balance,
                sender: etps_account,
                keypair: etpskeypair,
                secondKeypair: null,
                totalFrozeAmount: user_data.balance
            });
        } catch (e) {
            return setImmediate(cb, e.toString());
        }

        transactionMod.prototype.receiveTransactions([transaction], true, cb4);

    }, function (err, transaction) {
        if (err) {
            return setImmediate(cb, err);
        }
        cb();
    });
}

function etpsNewsMigrationProcess() {

    async.series({

        send_trx_frozen_and_stake_order: function (sendTrs_callback) {
            logger.info('Send the Frozed/Staked Amount and Updating the Stake Orders for 8 Orders');

            self.scope.db.query(sql.getAccountForTrx).then(function (users_info) {

                async.eachSeries(users_info, function (etps_account, frozenDistribution) {

                    async.series({
                        send_trx: function (send_callback) {
                            let user_details = {
                                balance: Math.round(((etps_account.quantity).toFixed(4)) * 100000000),
                                address: etps_account.address
                            }

                            setTimeout(function () {
                                SendTrs(user_details, function (err) {
                                    if (err) {
                                        return send_callback(err);
                                    }
                                    send_callback();
                                });
                            }, 400);
                        },

                        stake_order_query: function (stake_callback) {
                            let stake_details = {
                                id: etps_account.account_id,
                                startTime: slots.getTime(etps_account.insert_time),
                                insertTime: slots.getTime(),
                                senderId: etps_account.address,
                                freezedAmount: etps_account.quantity * 100000000,
                                rewardCount: 6 - etps_account.remain_month,
                                nextVoteMilestone: 0
                            }
                            self.scope.db.none(sql.insertStakeOrder, {
                                id: stake_details.id,
                                status: 1,
                                startTime: stake_details.startTime,
                                insertTime: stake_details.insertTime,
                                senderId: stake_details.senderId,
                                recipientId: null,
                                freezedAmount: stake_details.freezedAmount,
                                rewardCount: stake_details.rewardCount,
                                voteCount: 0,
                                nextVoteMilestone: stake_details.nextVoteMilestone
                            }).then(function () {
                                stake_callback();
                            }).catch(function (err) {
                                stake_callback(err);
                            });
                        }
                    }, function (err) {
                        if (err) {
                            return frozenDistribution(err);
                        }
                        frozenDistribution();
                    });

                }, function (err) {
                    if (err) {
                        return sendTrs_callback(err);
                    }
                    sendTrs_callback();
                });

            }).catch(function (error) {
                sendTrs_callback(error);
            });
        },

        migration_trx: function (migration_trx) {
            logger.info('Migration Type Transaction For 10 Migrated Users Started Successfully');

            self.scope.db.query(sql.getAccountForTrx).then(function (users_info) {
                async.eachSeries(users_info, function (etps_info, migrateTrx) {
                    let user_details = {
                        balance: Math.round(((etps_info.quantity).toFixed(4)) * 100000000),
                        address: etps_info.address,
                        passphrase: etps_info.passphrase,
                        publicKey: etps_info.publickey
                    }

                    setTimeout(function () {
                        MigrationTrs(user_details, function (err) {
                            if (err) {
                                return migrateTrx(err);
                            }
                            migrateTrx();
                        });
                    }, 400);
                }, function (err) {
                    if (err) {
                        return migration_trx(err);
                    }
                    migration_trx();
                });
            }).catch(function (err) {
                migration_trx(err);
            });
        }
    }, function (err) {
        if (err) {
            logger.error('Migration Error : ' + err);
            return err;
        }
        logger.info('Migration for 10 Froze Orders Successfully Finised');
    });
}