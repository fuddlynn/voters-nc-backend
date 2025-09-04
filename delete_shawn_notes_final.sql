-- Shawn Francis Notes Deletion Script
-- Run this in DB Browser for SQLite or via sqlite3 command line

-- Step 1: Check if Shawn Francis exists and get his NCID
SELECT '=== Shawn Francis Search ===' as step;
SELECT v.Unique_NC_Voter_Id, v.first_name, v.last_name, v.residence_street_name
FROM voters v
WHERE LOWER(v.first_name) = 'shawn'
AND LOWER(v.last_name) = 'francis'
AND LOWER(v.residence_street_name) LIKE '%freedom%';

-- Step 2: Check Shawn's current notes
SELECT '=== Shawn Francis Notes ===' as step;
SELECT n.note, n.created_at, n.updated_at
FROM voter_notes n
WHERE n.unique_nc_voter_id IN (
    SELECT v.Unique_NC_Voter_Id
    FROM voters v
    WHERE LOWER(v.first_name) = 'shawn'
    AND LOWER(v.last_name) = 'francis'
    AND LOWER(v.residence_street_name) LIKE '%freedom%'
);

-- Step 3: Delete Shawn's notes
SELECT '=== Deleting Shawn Francis Notes ===' as step;
DELETE FROM voter_notes
WHERE unique_nc_voter_id IN (
    SELECT v.Unique_NC_Voter_Id
    FROM voters v
    WHERE LOWER(v.first_name) = 'shawn'
    AND LOWER(v.last_name) = 'francis'
    AND LOWER(v.residence_street_name) LIKE '%freedom%'
);

-- Step 4: Verify deletion
SELECT '=== Verification - Notes Remaining ===' as step;
SELECT COUNT(*) as notes_remaining
FROM voter_notes
WHERE unique_nc_voter_id IN (
    SELECT v.Unique_NC_Voter_Id
    FROM voters v
    WHERE LOWER(v.first_name) = 'shawn'
    AND LOWER(v.last_name) = 'francis'
    AND LOWER(v.residence_street_name) LIKE '%freedom%'
);

-- Alternative: If Shawn exists but not on Freedom Drive
SELECT '=== All Francis Voters (if Shawn not on Freedom) ===' as step;
SELECT first_name, last_name, residence_street_name, Unique_NC_Voter_Id
FROM voters
WHERE LOWER(last_name) = 'francis'
ORDER BY first_name;
