import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name, email, subject, message } = body;

		// Validate required fields
		if (!name || !email || !subject || !message) {
			return NextResponse.json(
				{ error: 'All fields are required' },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: 'Invalid email format' },
				{ status: 400 }
			);
		}

		// Option 1: Using Resend (Recommended)
		// Uncomment and add your Resend API key to .env.local
		/*
		const RESEND_API_KEY = process.env.RESEND_API_KEY;
		if (!RESEND_API_KEY) {
			return NextResponse.json(
				{ error: 'Email service not configured' },
				{ status: 500 }
			);
		}

		const resendResponse = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${RESEND_API_KEY}`,
			},
			body: JSON.stringify({
				from: 'Portfolio Contact <onboarding@resend.dev>', // Update with your verified domain
				to: ['nirmalnaikca@gmail.com'],
				subject: `Portfolio Contact: ${subject}`,
				html: `
					<h2>New Contact Form Submission</h2>
					<p><strong>Name:</strong> ${name}</p>
					<p><strong>Email:</strong> ${email}</p>
					<p><strong>Subject:</strong> ${subject}</p>
					<p><strong>Message:</strong></p>
					<p>${message.replace(/\n/g, '<br>')}</p>
				`,
			}),
		});

		if (!resendResponse.ok) {
			const errorData = await resendResponse.json();
			throw new Error(errorData.message || 'Failed to send email');
		}
		*/

		// Using Web3Forms (Easy setup - get free access key from https://web3forms.com)
		const WEB3FORMS_ACCESS_KEY = process.env.WEB3FORMS_ACCESS_KEY;
		
		if (!WEB3FORMS_ACCESS_KEY) {
			// Log for development, but return error in production
			console.log('Contact form submission (no email service configured):', { name, email, subject, message });
			return NextResponse.json(
				{ 
					error: 'Email service not configured. Please add WEB3FORMS_ACCESS_KEY to your .env.local file. Get a free key at https://web3forms.com' 
				},
				{ status: 500 }
			);
		}

		const web3formsResponse = await fetch('https://api.web3forms.com/submit', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				access_key: WEB3FORMS_ACCESS_KEY,
				name,
				email,
				subject,
				message,
				from_name: name,
				to_email: 'nirmalnaikca@gmail.com',
			}),
		});

		const web3formsData = await web3formsResponse.json();

		if (!web3formsResponse.ok) {
			throw new Error(web3formsData.message || 'Failed to send email');
		}

		return NextResponse.json(
			{ message: 'Message sent successfully!' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Contact form error:', error);
		return NextResponse.json(
			{ error: 'Failed to send message. Please try again later.' },
			{ status: 500 }
		);
	}
}
