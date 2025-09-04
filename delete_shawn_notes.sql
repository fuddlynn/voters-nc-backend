-- Delete all notes for Shawn Francis on Freedom Drive
DELETE FROM voter_notes
WHERE unique_nc_voter_id IN (
    SELECT v.Unique_NC_Voter_Id
    FROM voters v
    WHERE LOWER(v.first_name) = 'shawn'
    AND LOWER(v.last_name) = 'francis'
    AND LOWER(v.residence_street_name) LIKE '%freedom%'
);

-- Show how many notes were deleted
SELECT changes() as notes_deleted;
