

let Accounts = {

	checkAccountStatus : 'SELECT "status" FROM mem_accounts WHERE "address"=${senderId}',

	findActiveStakeAmount: '(SELECT "startTime" AS "value" FROM stake_orders WHERE "senderId" = ${senderId} ORDER BY "startTime" DESC LIMIT 1) UNION ALL (SELECT SUM("freezedAmount") as "value" FROM stake_orders WHERE "senderId" = ${senderId} AND "status" = 1);',

	findActiveStake: 'SELECT * FROM stake_orders WHERE "senderId" = ${senderId} AND "status" = 1',
  
	findGroupBonus: 'SELECT "group_bonus", "pending_group_bonus" FROM mem_accounts WHERE "address"=${senderId}',

	findDirectSponsor: 'SELECT address FROM referals WHERE level[1] = ${introducer}',

	updatePendingGroupBonus: 'UPDATE mem_accounts SET "pending_group_bonus" = "pending_group_bonus" - ${nextBonus} WHERE "address"=${senderId}',

	disableAccount : 'UPDATE mem_accounts SET "status" = 0 WHERE "address" = ${senderId}',

	enableAccount : 'UPDATE mem_accounts SET "status" = 1 WHERE "address" = ${senderId}',

	getTotalAccount : 'SELECT count("address") FROM mem_accounts',

	getCurrentUnmined : 'SELECT "balance" FROM mem_accounts WHERE "address"=${address}',

	checkAlreadyMigrated : 'SELECT "isMigrated" FROM mem_accounts WHERE "name"=${username}',
  
	updateUserInfo : 'UPDATE mem_accounts SET "balance" = ${balance},"u_balance"=${balance},"email" = ${email}, "phoneNumber" = ${phone}, "country" = ${country}, "name" = ${username}, "totalFrozeAmount"=${totalFrozeAmount}, "isMigrated" = 1, "group_bonus" = ${group_bonus} WHERE "address" = ${address}',

	validateExistingUser: 'SELECT "id" FROM etps_user  WHERE  "username"=${username} AND "password"=${password}',

	findTrsUser: 'SELECT * FROM trs WHERE "senderId" = ${senderId}',

	findTrs: 'SELECT * FROM trs WHERE "id" = ${transactionId}',

	InsertStakeOrder: 'INSERT INTO stake_orders ("id", "status", "startTime", "insertTime", "senderId", "freezedAmount", "rewardCount", "nextVoteMilestone") VALUES (${account_id},${status},${startTime},${insertTime},${senderId},${freezedAmount},${rewardCount},${nextVoteMilestone}) ',

	getETPSStakeOrders: 'SELECT * FROM existing_etps_assets_m WHERE "account_id"=${account_id} AND "status"=0 AND "month_count" < 6',

	totalFrozeAmount: 'SELECT sum("freezedAmount") FROM stake_orders WHERE "id"=${account_id} and "status"=1',

	updateStakeOrder: 'UPDATE stake_orders SET "voteCount"="voteCount"+1, "nextVoteMilestone"=${currentTime}+${milestone} WHERE "senderId"=${senderId} AND "status"=1 AND ( "nextVoteMilestone" = 0 OR ${currentTime} >= "nextVoteMilestone")',

	GetOrders: 'SELECT * FROM stake_orders WHERE "senderId"=${senderId} AND "status" = 1',
	
	checkWeeklyVote: 'SELECT count(*) FROM stake_orders WHERE "senderId"=${senderId} AND "status"=1 AND ( "nextVoteMilestone" = 0 OR ${currentTime} >= "nextVoteMilestone")',

    updateETPSUserInfo: 'UPDATE etps_user SET "transferred_time"=${insertTime}, "transferred_etp"=1 WHERE "id"=${userId} ',

	validateReferSource : 'SELECT count(*) AS "address" FROM mem_accounts WHERE "address" = ${referSource}',

	findPassPhrase : 'SELECT "passphrase","transferred_etp" FROM migrated_etps_users WHERE "username" = ${userName}',

	updateEtp : 'UPDATE migrated_etps_users SET "transferred_etp" = 1,"transferred_time" = ${transfer_time} WHERE "address" = ${address}',

	validateEtpsUser : 'SELECT "id","phone" FROM etps_user WHERE "username" = ${username} AND "email" = ${emailId}',

	updateEtpsPassword: 'UPDATE etps_user SET "password" = ${password} WHERE "username" = ${username}',

	checkSenderBalance: 'SELECT balance FROM mem_accounts WHERE "address" = ${sender_address}',

	getMigratedList: 'SELECT m."address",e."username",m."totalFrozeAmount",m."balance",e."transferred_time",count(*) OVER() AS "user_count" FROM migrated_etps_users e INNER JOIN mem_accounts m ON(e."address" = m."address" AND e.transferred_etp = 1) order by e."transferred_time" DESC LIMIT ${limit} OFFSET ${offset}',

	checkReferStatus: 'SELECT count(*)::int as "address" FROM referals WHERE "address"= ${address}',
	
	updateMigratedUserInfo: 'UPDATE migrated_etps_users SET "transferred_etp" = 0 , "transferred_time" = null WHERE "username" = ${username}',

	checkValidEtpsUser: 'SELECT count(*)::int as count FROM migrated_etps_users WHERE "username" = ${username}',

	addressBasedSearch: 'SELECT e."address",e."username",m."totalFrozeAmount",e."transferred_time" FROM migrated_etps_users e INNER JOIN mem_accounts m ON(m."address" = ${address} AND e."address" = ${address} AND e.transferred_etp = 1)',

	usernameBasedSearch: 'SELECT e."username",e."address",e."transferred_time",m."totalFrozeAmount" FROM migrated_etps_users e INNER JOIN mem_accounts m ON(e."username" = ${username} AND m."address" = e."address" AND e.transferred_etp = 1)',

	checkVoteCount: 'SELECT count("id") FROM stake_orders WHERE "senderId" = ${senderId} AND "status" = 1 AND "voteCount" IN (3 , 7, 11, 15, 19, 23)',

	updateUserStatus: 'UPDATE mem_accounts SET "user_status" = ${status}, "agreed_timestamp" = ${agreed_time} WHERE "address"= ${address}',

	getUserStatusList: 'SELECT "address","user_status","agreed_timestamp", count(*) OVER() AS "user_count" FROM mem_accounts WHERE "user_status"= \'AGREED\' order by agreed_timestamp DESC LIMIT ${limit} OFFSET ${offset}',

	addressBasedStatusSearch: 'SELECT "address","user_status","agreed_timestamp" FROM mem_accounts WHERE "address"= ${address} AND "user_status"= \'AGREED\'',

	getUnMigratedList: 'SELECT e."username",m."totalFrozeAmount",count(*) OVER() AS "user_count" FROM migrated_etps_users e INNER JOIN mem_accounts m ON(e."address" = m."address" AND e.transferred_etp = 0) LIMIT ${limit} OFFSET ${offset}',

	unMigratedUserSearch: 'SELECT e."username",m."totalFrozeAmount" FROM migrated_etps_users e INNER JOIN mem_accounts m ON(e."username" = ${username} AND m."address" = e."address" AND e.transferred_etp = 0)'
};

module.exports = Accounts;
