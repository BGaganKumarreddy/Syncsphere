const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User.model');

const INVITE_SECRET = process.env.JWT_SECRET + '_invite';
const INVITE_EXPIRES = '48h'; // invite links valid for 48 hours

// ─── helpers ────────────────────────────────────────────────────────────────

/** Build all platform share payloads for a given invite link */
function buildShareUrls(link, inviteeEmail = '') {
    const message = `You've been invited to join SyncSphere! Click the link to create your account: ${link}`;
    const encodedMsg = encodeURIComponent(message);

    return {
        link,
        whatsappUrl: `https://wa.me/?text=${encodedMsg}`,
        slackUrl: `https://slack.com/intl/en-in/help/articles/201330736-add-someone-to-a-workspace?text=${encodedMsg}`,
        telegramUrl: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("You've been invited to join SyncSphere!")}`,
        emailSent: false,
    };
}

/** Send invite email via nodemailer */
async function sendInviteEmail(toEmail, link, inviterName) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"SyncSphere" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `${inviterName} invited you to join SyncSphere`,
        html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);width:56px;height:56px;border-radius:14px;line-height:56px;font-size:24px;margin-bottom:12px;">🔗</div>
            <h1 style="margin:0;font-size:22px;color:#fff;">You've been invited!</h1>
            <p style="color:#94a3b8;margin:8px 0 0;">Join <strong style="color:#818cf8;">SyncSphere</strong> and start collaborating</p>
          </div>

          <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:20px;">
            <p style="margin:0 0 8px;color:#94a3b8;font-size:14px;"><strong style="color:#e2e8f0;">${inviterName}</strong> has invited you to join their workspace on SyncSphere.</p>
            <p style="margin:0;color:#94a3b8;font-size:13px;">This invite link expires in <strong>48 hours</strong>.</p>
          </div>

          <div style="text-align:center;margin-bottom:20px;">
            <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:0.2px;">
              Join Workspace 🎉
            </a>
          </div>

          <p style="font-size:12px;color:#475569;text-align:center;margin:0;">
            Or paste this link in your browser:<br/>
            <a href="${link}" style="color:#818cf8;word-break:break-all;">${link}</a>
          </p>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}

// ─── controllers ────────────────────────────────────────────────────────────

// @route  POST /api/invites/generate
// @access Private / ADMIN only
const generateInvite = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Only admins can generate invite links');
        }

        const { role = 'MEMBER' } = req.body;

        if (!['ADMIN', 'MEMBER', 'GUEST'].includes(role)) {
            res.status(400);
            throw new Error('Invalid role');
        }

        const token = jwt.sign(
            { invitedRole: role, invitedBy: req.user._id },
            INVITE_SECRET,
            { expiresIn: INVITE_EXPIRES }
        );

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const link = `${clientUrl}/invite/accept?token=${token}`;

        res.json({ link, role, expiresIn: '48 hours' });
    } catch (err) {
        next(err);
    }
};

// @route  POST /api/invites/send
// @access Private / ADMIN only
// body: { email, role, platforms: ['email','whatsapp','slack','telegram','copy'] }
const sendInvite = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Only admins can send invites');
        }

        const { email, role = 'MEMBER', platforms = ['copy'] } = req.body;

        if (!email) {
            res.status(400);
            throw new Error('Invitee email is required');
        }

        if (!['ADMIN', 'MEMBER', 'GUEST'].includes(role)) {
            res.status(400);
            throw new Error('Invalid role. Must be ADMIN, MEMBER, or GUEST');
        }

        // Check if user already exists
        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) {
            res.status(409);
            throw new Error('A user with this email already exists');
        }

        // Generate the invite token
        const token = jwt.sign(
            { invitedRole: role, invitedBy: req.user._id, inviteeEmail: email.toLowerCase() },
            INVITE_SECRET,
            { expiresIn: INVITE_EXPIRES }
        );

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const link = `${clientUrl}/invite/accept?token=${token}`;

        // Build all share URLs
        const shareUrls = buildShareUrls(link, email);

        // Send email if requested
        if (platforms.includes('email')) {
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                res.status(500);
                throw new Error('Email is not configured on the server. Add EMAIL_USER and EMAIL_PASS to .env');
            }
            try {
                await sendInviteEmail(email, link, req.user.name);
                shareUrls.emailSent = true;
            } catch (emailErr) {
                // Return a partial success — link still works even if email failed
                return res.status(207).json({
                    ...shareUrls,
                    emailSent: false,
                    emailError: 'Failed to send email. Check EMAIL_USER and EMAIL_PASS in .env',
                    role,
                    expiresIn: '48 hours',
                });
            }
        }

        res.json({ ...shareUrls, role, expiresIn: '48 hours' });
    } catch (err) {
        next(err);
    }
};

// @route  POST /api/invites/accept
// @access Public (used during signup via invite link)
const acceptInvite = async (req, res, next) => {
    try {
        const { token, name, password } = req.body;

        if (!token || !name || !password) {
            res.status(400);
            throw new Error('token, name and password are required');
        }

        let decoded;
        try {
            decoded = jwt.verify(token, INVITE_SECRET);
        } catch (_) {
            res.status(400);
            throw new Error('Invite link is invalid or has expired');
        }

        const { invitedRole, inviteeEmail } = decoded;

        // Use the email from the token (if embedded when sending) or from the request body
        const { email } = req.body;
        const finalEmail = inviteeEmail || email;

        if (!finalEmail) {
            res.status(400);
            throw new Error('email is required');
        }

        const exists = await User.findOne({ email: finalEmail.toLowerCase() });
        if (exists) {
            res.status(409);
            throw new Error('An account with this email already exists');
        }

        const user = await User.create({
            name,
            email: finalEmail.toLowerCase(),
            password,
            role: invitedRole,
        });

        // Return a login token so the user is immediately authenticated
        const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: authToken,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { generateInvite, acceptInvite, sendInvite };
