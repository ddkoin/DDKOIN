

let pgp = require('pg-promise');

let DelegatesSql = {
	sortFields: [
		'username',
		'address',
		'publicKey',
		'vote',
		'missedblocks',
		'producedblocks',
		'approval',
		'productivity',
		'voters_cnt',
		'register_timestamp'
	],

	count: 'SELECT COUNT(*)::int FROM delegates',

	search: function (params) {
		let sql = [
			'WITH',
			'supply AS (SELECT calcSupply((SELECT height FROM blocks ORDER BY height DESC LIMIT 1))::numeric),',
			'delegates AS (SELECT row_number() OVER (ORDER BY vote DESC, m."publicKey" ASC)::int AS rank,',
			'm.username,',
			'm.address,',
			'ENCODE(m."publicKey", \'hex\') AS "publicKey",',
			'm.vote,',
			'm.producedblocks,',
			'm.missedblocks,',
			'ROUND(vote / (SELECT * FROM supply) * 100, 2)::float AS approval,',
			'(CASE WHEN producedblocks + missedblocks = 0 THEN 0.00 ELSE',
			'ROUND(100 - (missedblocks::numeric / (producedblocks + missedblocks) * 100), 2)',
			'END)::float AS productivity,',
			'COALESCE(v.voters_cnt, 0) AS voters_cnt,',
			't.timestamp AS register_timestamp',
			'FROM delegates d',
			'LEFT JOIN mem_accounts m ON d.username = m.username',
			'LEFT JOIN trs t ON d."transactionId" = t.id',
			'LEFT JOIN (SELECT "dependentId", COUNT(1)::int AS voters_cnt from mem_accounts2delegates GROUP BY "dependentId") v ON v."dependentId" = ENCODE(m."publicKey", \'hex\')',
			'WHERE m."isDelegate" = 1',
			'ORDER BY ' + [params.sortField, params.sortMethod].join(' ') + ')',
			'SELECT * FROM delegates WHERE LOWER(username) LIKE ${q} LIMIT ${limit}'
		].join(' ');

		params.q = '%' + String(params.q).toLowerCase() + '%';
		return pgp.as.format(sql, params);
	},

	insertFork: 'INSERT INTO forks_stat ("delegatePublicKey", "blockTimestamp", "blockId", "blockHeight", "previousBlock", "cause") VALUES (${delegatePublicKey}, ${blockTimestamp}, ${blockId}, ${blockHeight}, ${previousBlock}, ${cause});',

	getVoters: 'SELECT accounts.address, accounts.balance, encode(accounts."publicKey", \'hex\') AS "publicKey" FROM mem_accounts2delegates delegates INNER JOIN mem_accounts accounts ON delegates."accountId" = accounts.address WHERE delegates."dependentId" = ${publicKey} ORDER BY accounts."balance" LIMIT ${limit} OFFSET ${offset}',

	getVotersCount:'SELECT count(*) FROM mem_accounts2delegates WHERE "dependentId" = ${publicKey}',

	getLatestVoters: 'SELECT "id","senderId","timestamp" FROM trs WHERE type = 3 ORDER BY timestamp DESC LIMIT ${limit}',

	getLatestDelegates: 'SELECT d."username" AS "username", t."t_senderId" AS "address", ENCODE(t."t_senderPublicKey", \'hex\') AS "publicKey", t."t_timestamp" AS "timestamp" FROM trs_list t INNER JOIN delegates d ON t."t_id" = d."transactionId" WHERE t."t_type" = 2 ORDER BY "t_timestamp" DESC LIMIT ${limit}'
};

module.exports = DelegatesSql;
