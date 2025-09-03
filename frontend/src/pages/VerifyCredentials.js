import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Launch as LaunchIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useWallet } from '../contexts/WalletContext';
import ipfsService from '../utils/ipfsService';   // ✅ fixed import
import { format } from 'date-fns';

const VerifyCredentials = () => {
  const { verifyCredential, getCredential, getStudentCredentials } = useWallet();

  const [searchMethod, setSearchMethod] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCredential, setSelectedCredential] = useState(null);
  const [ipfsData, setIpfsData] = useState(null);
  const [isLoadingIpfs, setIsLoadingIpfs] = useState(false);

  const handleSearchMethodChange = (event, newValue) => {
    setSearchMethod(newValue);
    setSearchValue('');
    setSearchResults([]);
    setSelectedCredential(null);
    setIpfsData(null);
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    setSelectedCredential(null);
    setIpfsData(null);

    try {
      if (searchMethod === 0) {
        // Search by Student ID
        const credentialHashes = await getStudentCredentials(searchValue);
        const credentials = [];

        for (const hash of credentialHashes) {
          const credential = await getCredential(hash);
          if (credential) {
            credentials.push({ hash, ...credential });
          }
        }
        setSearchResults(credentials);
      } else {
        // Search by Credential Hash
        const isValid = await verifyCredential(searchValue);
        if (isValid) {
          const credential = await getCredential(searchValue);
          if (credential) {
            setSearchResults([{ hash: searchValue, ...credential }]);
          }
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error('Error searching credentials:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCredentialSelect = async (credential) => {
    setSelectedCredential(credential);
    setIpfsData(null);

    if (credential.ipfsHash && credential.ipfsHash.trim() !== '') {
      setIsLoadingIpfs(true);
      try {
        const data = await ipfsService.getTranscript(credential.ipfsHash);
        setIpfsData(data);
      } catch (error) {
        console.error('Error loading IPFS data:', error);
        setIpfsData(null);
      } finally {
        setIsLoadingIpfs(false);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (credential) =>
    credential.isRevoked ? <CancelIcon color="error" /> : <CheckCircleIcon color="success" />;

  const getStatusChip = (credential) =>
    credential.isRevoked ? (
      <Chip label="Revoked" color="error" size="small" icon={<CancelIcon />} />
    ) : (
      <Chip label="Valid" color="success" size="small" icon={<CheckCircleIcon />} />
    );

  const formatDate = (timestamp) => format(new Date(timestamp * 1000), 'PPP');

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Verify Academic Credentials
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Search Section */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Search Credentials
              </Typography>

              <Tabs value={searchMethod} onChange={handleSearchMethodChange} sx={{ mb: 3 }}>
                <Tab label="Search by Student ID" />
                <Tab label="Search by Credential Hash" />
              </Tabs>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label={searchMethod === 0 ? 'Student ID' : 'Credential Hash'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchMethod === 0 ? 'Enter student ID' : 'Enter credential hash'}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={!searchValue.trim() || isSearching}
                  startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                  sx={{ minWidth: 120 }}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </Box>

              {searchMethod === 0 && (
                <Alert severity="info">
                  Search for all credentials issued to a specific student by their unique student ID.
                </Alert>
              )}

              {searchMethod === 1 && (
                <Alert severity="info">
                  Verify a specific credential using its unique hash.
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Search Results ({searchResults.length})
                </Typography>

                {searchResults.map((credential) => (
                  <Paper
                    key={credential.hash}
                    sx={{
                      p: 3,
                      mb: 2,
                      border: selectedCredential?.hash === credential.hash ? 2 : 1,
                      borderColor:
                        selectedCredential?.hash === credential.hash ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handleCredentialSelect(credential)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {credential.degree} in {credential.courseName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Student ID: {credential.studentId}
                        </Typography>
                      </Box>
                      {getStatusIcon(credential)}
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SchoolIcon fontSize="small" color="action" />
                          <Typography variant="body2">{credential.universityName}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            Graduated: {formatDate(credential.graduationDate)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {getStatusChip(credential)}
                      <Typography variant="caption" color="text.secondary">
                        Issued: {formatDate(credential.issuedAt)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {searchResults.length === 0 && searchValue && !isSearching && (
            <Card>
              <CardContent>
                <Alert severity="info">
                  No credentials found for the provided search criteria.
                </Alert>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Credential Details Sidebar */}
        <Grid item xs={12} md={4}>
          {selectedCredential ? (
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Credential Details
              </Typography>

              <Box sx={{ mb: 3 }}>{getStatusChip(selectedCredential)}</Box>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Student ID
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedCredential.studentId}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Degree
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedCredential.degree}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Course/Major
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedCredential.courseName}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  University
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedCredential.universityName}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Graduation Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(selectedCredential.graduationDate)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Issued Date
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(selectedCredential.issuedAt)}
                </Typography>
              </Box>

              {selectedCredential.isRevoked && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Revoked Date
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {formatDate(selectedCredential.revokedAt)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Credential Hash
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      bgcolor: 'grey.100',
                      p: 1,
                      borderRadius: 1,
                      flex: 1,
                    }}
                  >
                    {selectedCredential.hash}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => copyToClipboard(selectedCredential.hash)}
                    startIcon={<CopyIcon />}
                  >
                    Copy
                  </Button>
                </Box>
              </Box>

              {selectedCredential.ipfsHash && (
                <>
                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Additional Documents
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LaunchIcon />}
                      href={ipfsService.getGatewayURL(selectedCredential.ipfsHash)}
                      target="_blank"
                      sx={{ mt: 1 }}
                    >
                      View on IPFS
                    </Button>
                  </Box>

                  {isLoadingIpfs && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Loading documents...</Typography>
                    </Box>
                  )}

                  {ipfsData && (
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2">Document Details</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                          {JSON.stringify(ipfsData, null, 2)}
                        </pre>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Instructions
              </Typography>
              <Typography variant="body2" paragraph>
                1. Choose your search method (Student ID or Credential Hash).
              </Typography>
              <Typography variant="body2" paragraph>
                2. Enter the search criteria and click Search.
              </Typography>
              <Typography variant="body2" paragraph>
                3. Click on a credential to view detailed information.
              </Typography>
              <Typography variant="body2">
                4. Verify the credential status and access additional documents if available.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default VerifyCredentials;
