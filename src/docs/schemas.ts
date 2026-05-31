/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Jane Doe
 *         email:
 *           type: string
 *           format: email
 *           example: jane@example.com
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "Str0ng!Pass"
 *           description: |
 *             Must contain:
 *             - At least 8 characters
 *             - One uppercase letter
 *             - One lowercase letter
 *             - One number
 *             - One special character (!@#$%^&*...)
 *
 *     LoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: jane@example.com
 *         password:
 *           type: string
 *           example: "Str0ng!Pass"
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful
 *         data:
 *           type: object
 *           properties:
 *             accessToken:
 *               type: string
 *               description: JWT access token (15 min expiry)
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             user:
 *               $ref: '#/components/schemas/User'
 *
 *     ForgotPasswordRequest:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: jane@example.com
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required: [token, password]
 *       properties:
 *         token:
 *           type: string
 *           description: Token received via email
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "NewStr0ng!Pass"
 *
 *     VerifyEmailRequest:
 *       type: object
 *       required: [token]
 *       properties:
 *         token:
 *           type: string
 *           description: Token received via email
 *
 *     RefreshTokenRequest:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Optional if httpOnly cookie is present
 *
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Jane Smith
 *
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 142
 *         page:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 20
 *         totalPages:
 *           type: integer
 *           example: 8
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *         hasPrevPage:
 *           type: boolean
 *           example: false
 *
 *     ValidationErrorItem:
 *       type: object
 *       properties:
 *         field:
 *           type: string
 *           example: email
 *         message:
 *           type: string
 *           example: Invalid email format
 */

// This file is intentionally empty at runtime — it exists only for Swagger JSDoc parsing.
export {};
