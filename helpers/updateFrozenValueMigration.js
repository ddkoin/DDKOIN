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
    etpsMigrationProcess()
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

function etpsMigrationProcess() {

    async.series({

        migration_trx: function (migration_trx) {
            logger.info('Updating Frozen Amount For Migrated Users Started Successfully');

            let array = ["DDK4406918524907503741",
                "DDK14201828890991646408",
                "DDK15860322006059052825",
                "DDK3565946020055658501",
                "DDK9595062045425359775",
                "DDK16891697691085572180",
                "DDK3999411045531588356",
                "DDK13573783991323567907",
                "DDK14517661547655694134",
                "DDK8197186548811122751",
                "DDK13457360159415163305",
                "DDK14468246521049594077",
                "DDK6868591673316979107",
                "DDK10253076690425672712",
                "DDK2280943461993640175",
                "DDK17846844519992702950",
                "DDK7922515572966418138",
                "DDK11550113126020052853",
                "DDK18203820327398884383",
                "DDK14197167228612982094",
                "DDK10681767757143135137",
                "DDK16050987698820165133",
                "DDK10404698103864690401",
                "DDK9266277742806951058",
                "DDK10018939657663509862",
                "DDK1906276206644097693",
                "DDK12355328955515594020",
                "DDK8510865561109377001",
                "DDK6373912626169315228",
                "DDK11360521474506250697",
                "DDK6471694251065084923",
                "DDK2805687032944842659",
                "DDK4933965460653096683",
                "DDK17068333014765617511",
                "DDK4533601124074583672",
                "DDK17800801454991866723",
                "DDK4154339679203916235",
                "DDK3674041578649263105",
                "DDK1548992377000055861",
                "DDK7360296148487698364",
                "DDK2199007423454123902",
                "DDK5441777346185008766",
                "DDK6576186922336564905",
                "DDK16848758875818765186",
                "DDK5551004456764947079",
                "DDK8854701693990885633",
                "DDK4604096350622608450",
                "DDK7497151665528860372",
                "DDK17551645235906928134",
                "DDK8791832090827003728",
                "DDK12080771107131654717",
                "DDK15965252447595932806",
                "DDK1808672476387914936",
                "DDK4994735966430348242",
                "DDK16377755245265873982",
                "DDK11759061453482970970",
                "DDK6124199284335274065",
                "DDK13481718312004293167",
                "DDK11298273925172325196",
                "DDK1586192851062888827",
                "DDK16921680551439161813",
                "DDK2841141551156189102",
                "DDK643434836231910933",
                "DDK8200636047684429906",
                "DDK13944823704405133801",
                "DDK6049246695790372247",
                "DDK6339348889732489472",
                "DDK12148504737222559568",
                "DDK15789816705939960537",
                "DDK13561633305762245653",
                "DDK9408156842539952549",
                "DDK8029665167033272598",
                "DDK15364905868118960346",
                "DDK17452438663604364620",
                "DDK9115942672176891100",
                "DDK7733561581540968851",
                "DDK8766164222072391608",
                "DDK635587340224358149",
                "DDK6338592031445036709",
                "DDK9903407631546990530",
                "DDK1782500226620716641",
                "DDK17426490569699808383",
                "DDK15474304772238722457",
                "DDK2974822924936893282",
                "DDK13553018560839201251",
                "DDK3264525568787128391",
                "DDK1207290254179251657",
                "DDK9743159231963320224",
                "DDK6578189356868220844",
                "DDK7076554201095768855",
                "DDK15444068883383342652",
                "DDK4983962944487709990",
                "DDK8012908006552146569",
                "DDK16986912505556504922",
                "DDK13622109102503538915",
                "DDK7455828988368400461",
                "DDK3935231113220348536",
                "DDK12271227697066721315",
                "DDK11832649693768432171",
                "DDK10317388892652321525",
                "DDK14151086285206997983",
                "DDK6584471670197985092",
                "DDK14679429469485471110",
                "DDK11886767858560696257",
                "DDK16355498918854738987",
                "DDK15523586861551641548",
                "DDK4685719294934567837",
                "DDK14973086398653319163",
                "DDK5585181311135831985",
                "DDK2914466406747283199",
                "DDK15118889754059687142",
                "DDK2146369671872624745",
                "DDK16652413491406639893",
                "DDK2376456473896123178",
                "DDK9472668715205433708",
                "DDK5483805068131628650",
                "DDK138360116344557936"
            ];

            async.eachSeries(testing, function (etps_info, migrateTrx) {

                self.scope.db.query(sql.getAccountInfo, {
                    address: etps_info
                }).then(function (user_info) {

                    self.scope.db.query(sql.calculateFrozedAmount, {
                        address: etps_info
                    }).then(function (user) {

                        let user_details = {
                            balance: user[0].freezed_amount,
                            address: etps_info,
                            passphrase: user_info[0].passphrase,
                            publicKey: user_info[0].publickey
                        }

                        setTimeout(function () {
                            MigrationTrs(user_details, function (err) {
                                if (err) {
                                    return migrateTrx(err);
                                }
                                migrateTrx();
                            });
                        }, 400);
                    }).catch(function (err) {
                        return migrateTrx(err);
                    });
                }).catch(function (err) {
                    return migrateTrx(err);
                });

            }, function (err) {
                if (err) {
                    return migration_trx(err);
                }
                migration_trx();
            });
        }
    }, function (err) {
        if (err) {
            logger.error('Migration Error : ' + err);
            return err;
        }
        logger.info('Updations for Frozed Amount Successfully Finised');
    });
}