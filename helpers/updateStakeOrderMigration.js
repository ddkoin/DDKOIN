var async = require('async');
let Logger = require('../logger.js');
let logman = new Logger();
let logger = logman.logger;
let sql = require('../sql/referal_sql');

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
    etpsMigrationProcess()
}

function etpsMigrationProcess() {

    async.series({

        update_stake: function (update_stake_status) {
            logger.info('Updating Stake Orders to InActive For Migrated Users Started Successfully');

            let array = ["DDK8122016037229822563",
                "DDK7813492427917180246",
                "DDK10577520025933149080",
                "DDK6739680457772175070",
                "DDK12639824152114552440",
                "DDK11016046824157854908",
                "DDK14578724380939726245",
                "DDK5150701223536947078",
                "DDK5552378844993813695",
                "DDK2566464981402228839",
                "DDK18313363510268466816",
                "DDK10602752260069134971",
                "DDK16649592797138422700",
                "DDK15495065649066483808",
                "DDK1120399606602892735",
                "DDK1635184041661272796",
                "DDK16965086179140743171",
                "DDK9446659337782751355",
                "DDK13172313251276485796",
                "DDK8046386479913718992",
                "DDK4083449115306470141",
                "DDK2156449422508759478"
            ];

            async.eachSeries(array, function (etps_info, unstake_users) {

                self.scope.db.query(sql.getStakeInfo, {
                    address: etps_info
                }).then(function (user_info) {

                    async.eachSeries(user_info, function (stake_orders, stake_disbale) {

                        self.scope.db.none(sql.updateStakeStatus, {
                            address: stake_orders.senderId,
                            stake_id: stake_orders.stakeId
                        }).then(function () {
                            stake_disbale();
                        }).catch(function (err) {
                            return stake_disbale(err);
                        });

                    }, function (err) {
                        if (err) {
                            return stake_disbale(err);
                        }
                        unstake_users();
                    });

                }).catch(function (err) {
                    return unstake_users(err);
                });

            }, function (err) {
                if (err) {
                    return update_stake_status(err);
                }
                update_stake_status();
            });
        }
    }, function (err) {
        if (err) {
            logger.error('Migration Error : ' + err);
            return err;
        }
        logger.info('Updations for stake orders Successfully Completed');
    });
}