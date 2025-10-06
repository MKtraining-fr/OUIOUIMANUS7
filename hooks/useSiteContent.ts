import { useState, useEffect, useCallback } from 'react';
import { SiteContent } from '../types';
import { api } from '../services/api';
import { DEFAULT_SITE_CONTENT, resolveSiteContent } from '../utils/siteContent';
