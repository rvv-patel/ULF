const pool = require('../config/database');

const testGetAll = async () => {
    try {
        // Fetch one application to get its ID
        const res = await pool.query('SELECT id FROM applications LIMIT 1');
        if (res.rows.length === 0) {
            console.log('No applications found.');
            return;
        }
        const appId = res.rows[0].id;
        console.log(`Testing with App ID: ${appId} (Type: ${typeof appId})`);

        // Insert a dummy query if none exists
        await pool.query('INSERT INTO application_queries (id, "applicationId", "date", "queryDetails", "remarks", "raisedBy", "isResolved") VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
            [Date.now(), appId, '2026-02-15', 'Test Query', 'Test', 'System', false]);

        // Now run the logic from getAll
        const itemsResult = await pool.query('SELECT * FROM applications WHERE id = $1', [appId]);
        const items = itemsResult.rows;

        const appIds = items.map(app => app.id);
        console.log('App IDs for query:', appIds);

        const queriesResult = await pool.query(
            'SELECT * FROM application_queries WHERE "applicationId" = ANY($1::bigint[])',
            [appIds]
        );

        console.log(`Found ${queriesResult.rows.length} queries.`);
        if (queriesResult.rows.length > 0) {
            console.log('Sample Query appId:', queriesResult.rows[0].applicationId, 'Type:', typeof queriesResult.rows[0].applicationId);
        }

        const queriesByAppId = queriesResult.rows.reduce((acc, query) => {
            if (!acc[query.applicationId]) {
                acc[query.applicationId] = [];
            }
            acc[query.applicationId].push(query);
            return acc;
        }, {});

        console.log('Queries mapped by ID keys:', Object.keys(queriesByAppId));

        items.forEach(app => {
            app.queries = queriesByAppId[app.id] || [];
        });

        console.log('App with queries:', JSON.stringify(items[0].queries));

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
};

testGetAll();
