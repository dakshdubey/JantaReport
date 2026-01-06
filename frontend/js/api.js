const API_URL = `${window.location.origin}/api`;

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    patch(endpoint, body) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });
    },

    async postFormData(endpoint, formData) {
        const token = localStorage.getItem('token');
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);
            const contentType = response.headers.get("content-type");
            let data = {};

            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                const text = await response.text();
                if (!response.ok) {
                    if (response.status === 413) throw new Error('File is too large (Max 100MB). If you are using a network tunnel, it might have a smaller limit.');
                    throw new Error(`Server Error (${response.status}): ${text.substring(0, 100)}`);
                }
                data = { message: text };
            }

            if (!response.ok) throw new Error(data.error || data.message || 'Upload failed');
            return data;
        } catch (error) {
            console.error('Upload Error:', error);
            throw error;
        }
    },

    uploadWithProgress(endpoint, formData, onProgress) {
        return new Promise((resolve, reject) => {
            const token = localStorage.getItem('token');
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_URL}${endpoint}`);

            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    if (onProgress) onProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                let data = {};
                const contentType = xhr.getResponseHeader("content-type");

                try {
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        data = JSON.parse(xhr.responseText);
                    } else {
                        data = { message: xhr.responseText };
                    }
                } catch (e) {
                    data = { message: xhr.responseText };
                }

                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(data);
                } else {
                    if (xhr.status === 413) {
                        reject(new Error('File is too large (Max 100MB). Tunnels/Proxies often block 100MB.'));
                    } else {
                        reject(new Error(data.error || data.message || 'Upload failed'));
                    }
                }
            };

            xhr.onerror = () => reject(new Error('Network error occurred during transmission.'));
            xhr.send(formData);
        });
    },

    getConfig() {
        return this.get('/config');
    }
};

const auth = {
    getToken: () => localStorage.getItem('token'),
    getUser: () => JSON.parse(localStorage.getItem('user')),

    login: (token, user) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
    },

    logout: () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const isAdmin = user && (user.role === 'CITY_ADMIN' || user.role === 'SUPER_ADMIN');

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        if (isAdmin) {
            window.location.href = '/admin/login.html';
        } else {
            window.location.href = '/login.html';
        }
    },

    isLoggedIn: () => !!localStorage.getItem('token'),

    redirectIfLoggedIn: () => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        if (token && user) {
            if (user.role === 'CITIZEN') window.location.href = '/citizen/dashboard.html';
            else if (user.role === 'CITY_ADMIN') window.location.href = '/admin/city-dashboard.html';
            else if (user.role === 'SUPER_ADMIN') window.location.href = '/admin/super-dashboard.html';
        }
    }
};
