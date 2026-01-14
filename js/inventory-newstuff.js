        // =====================================================
        // PAYMENT RECORDING SYSTEM
        // =====================================================

        function openRecordPaymentModal(invoiceId) {
            const invoice = invoices.find(i => (i.id === invoiceId || i.firestoreId === invoiceId));
            if (!invoice) {
                alert('Invoice not found');
                return;
            }

            const balance = invoice.amount - (invoice.amountPaid || 0);
            const payments = invoice.payments || [];

            const modal = document.createElement('div');
            modal.className = 'lease-modal-overlay';
            modal.id = 'record-payment-modal';
            modal.innerHTML = `
                <div class="lease-modal" style="max-width: 550px;">
                    <div class="modal-header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                        <h3 style="color: white; margin: 0;"><i class="fas fa-dollar-sign"></i> Record Payment</h3>
                        <button class="modal-close" onclick="closeLeaseModal('record-payment-modal')" style="color: white;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <!-- Invoice Summary -->
                        <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                <div>
                                    <div style="font-weight: 600; font-size: 16px; color: var(--text-primary);">${invoice.vendor}</div>
                                    <div style="font-size: 13px; color: var(--text-muted);">Invoice #${invoice.invoiceNumber || 'N/A'}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 12px; color: var(--text-muted);">Total Amount</div>
                                    <div style="font-size: 18px; font-weight: 700; color: var(--text-primary);">$${invoice.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; padding-top: 12px; border-top: 1px solid var(--border-color);">
                                <div style="text-align: center;">
                                    <div style="font-size: 11px; color: var(--text-muted);">Paid</div>
                                    <div style="font-size: 16px; font-weight: 600; color: #10b981;">$${(invoice.amountPaid || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 11px; color: var(--text-muted);">Balance</div>
                                    <div style="font-size: 16px; font-weight: 600; color: #ef4444;">$${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 11px; color: var(--text-muted);">Payments</div>
                                    <div style="font-size: 16px; font-weight: 600; color: var(--text-primary);">${payments.length}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Payment Form -->
                        <div class="form-group">
                            <label class="form-label">Payment Amount *</label>
                            <div style="position: relative;">
                                <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted);">$</span>
                                <input type="number" class="form-input" id="payment-amount" placeholder="0.00" step="0.01" max="${balance}" style="padding-left: 28px;" value="${balance.toFixed(2)}">
                            </div>
                            <div style="display: flex; gap: 8px; margin-top: 8px;">
                                <button type="button" class="btn-secondary" style="flex: 1; font-size: 12px;" onclick="document.getElementById('payment-amount').value = '${balance.toFixed(2)}'">
                                    Pay Full Balance
                                </button>
                                <button type="button" class="btn-secondary" style="flex: 1; font-size: 12px;" onclick="document.getElementById('payment-amount').value = '${(balance / 2).toFixed(2)}'">
                                    Pay 50%
                                </button>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="form-group">
                                <label class="form-label">Payment Date *</label>
                                <input type="date" class="form-input" id="payment-date" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Payment Method</label>
                                <select class="form-input" id="payment-method">
                                    <option value="check">Check</option>
                                    <option value="cash">Cash</option>
                                    <option value="card">Credit/Debit Card</option>
                                    <option value="transfer">Bank Transfer</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Reference # (Check #, Confirmation, etc.)</label>
                            <input type="text" class="form-input" id="payment-reference" placeholder="Optional reference number">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-input" id="payment-notes" rows="2" placeholder="Optional payment notes..."></textarea>
                        </div>

                        <!-- Payment History -->
                        ${payments.length > 0 ? `
                            <div style="margin-top: 20px;">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">
                                    <i class="fas fa-history"></i> Payment History
                                </div>
                                <div style="background: var(--bg-secondary); border-radius: 8px; overflow: hidden;">
                                    ${payments.map((p, idx) => `
                                        <div style="padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; ${idx < payments.length - 1 ? 'border-bottom: 1px solid var(--border-color);' : ''}">
                                            <div>
                                                <div style="font-weight: 500; color: var(--text-primary);">$${p.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                                                <div style="font-size: 11px; color: var(--text-muted);">${p.method || 'N/A'} ${p.reference ? '• ' + p.reference : ''}</div>
                                            </div>
                                            <div style="text-align: right;">
                                                <div style="font-size: 12px; color: var(--text-secondary);">${new Date(p.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="closeLeaseModal('record-payment-modal')">Cancel</button>
                        <button class="btn-primary" onclick="saveInvoicePayment('${invoiceId}')" style="background: #10b981;">
                            <i class="fas fa-check"></i> Record Payment
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('active'), 10);
        }

        async function saveInvoicePayment(invoiceId) {
            const amount = parseFloat(document.getElementById('payment-amount').value);
            const date = document.getElementById('payment-date').value;
            const method = document.getElementById('payment-method').value;
            const reference = document.getElementById('payment-reference').value.trim();
            const notes = document.getElementById('payment-notes').value.trim();

            if (!amount || amount <= 0) {
                alert('Please enter a valid payment amount');
                return;
            }

            if (!date) {
                alert('Please select a payment date');
                return;
            }

            const invoice = invoices.find(i => (i.id === invoiceId || i.firestoreId === invoiceId));
            if (!invoice) {
                alert('Invoice not found');
                return;
            }

            const balance = invoice.amount - (invoice.amountPaid || 0);
            if (amount > balance + 0.01) {
                alert(`Payment amount ($${amount.toFixed(2)}) exceeds balance ($${balance.toFixed(2)})`);
                return;
            }

            // Create payment record
            const payment = {
                amount: amount,
                date: date,
                method: method,
                reference: reference,
                notes: notes,
                recordedAt: new Date().toISOString(),
                recordedBy: typeof getCurrentUser === 'function' ? (getCurrentUser()?.name || 'Unknown') : 'Unknown'
            };

            // Update invoice
            const payments = invoice.payments || [];
            payments.push(payment);

            const newAmountPaid = (invoice.amountPaid || 0) + amount;
            const newStatus = newAmountPaid >= invoice.amount ? 'paid' : 'partial';

            try {
                // Update in Firebase
                if (typeof firebaseInvoiceManager !== 'undefined' && firebaseInvoiceManager.isInitialized && invoice.firestoreId) {
                    const db = firebase.firestore();
                    await db.collection('invoices').doc(invoice.firestoreId).update({
                        payments: payments,
                        amountPaid: newAmountPaid,
                        status: newStatus,
                        paidDate: newStatus === 'paid' ? date : null
                    });
                }

                // Update local
                invoice.payments = payments;
                invoice.amountPaid = newAmountPaid;
                invoice.status = newStatus;
                if (newStatus === 'paid') {
                    invoice.paidDate = date;
                }

                closeLeaseModal('record-payment-modal');
                showToast(`Payment of $${amount.toFixed(2)} recorded successfully!`, 'success');
                renderInvoices();
            } catch (error) {
                console.error('Error saving payment:', error);
                alert('Error recording payment. Please try again.');
            }
        }

        function viewPaymentHistory(invoiceId) {
            const invoice = invoices.find(i => (i.id === invoiceId || i.firestoreId === invoiceId));
            if (!invoice) return;

            const payments = invoice.payments || [];
            const balance = invoice.amount - (invoice.amountPaid || 0);

            const modal = document.createElement('div');
            modal.className = 'lease-modal-overlay';
            modal.id = 'payment-history-modal';
            modal.innerHTML = `
                <div class="lease-modal" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-history"></i> Payment History</h3>
                        <button class="modal-close" onclick="closeLeaseModal('payment-history-modal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="background: var(--bg-secondary); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                            <div style="font-weight: 600; margin-bottom: 8px;">${invoice.vendor} - #${invoice.invoiceNumber || 'N/A'}</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;">
                                <div>
                                    <div style="font-size: 11px; color: var(--text-muted);">Total</div>
                                    <div style="font-weight: 600;">$${invoice.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                                </div>
                                <div>
                                    <div style="font-size: 11px; color: var(--text-muted);">Paid</div>
                                    <div style="font-weight: 600; color: #10b981;">$${(invoice.amountPaid || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                                </div>
                                <div>
                                    <div style="font-size: 11px; color: var(--text-muted);">Balance</div>
                                    <div style="font-weight: 600; color: ${balance > 0 ? '#ef4444' : '#10b981'};">$${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                                </div>
                            </div>
                        </div>

                        ${payments.length === 0 ? `
                            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                                <i class="fas fa-receipt" style="font-size: 32px; margin-bottom: 12px;"></i>
                                <div>No payments recorded yet</div>
                            </div>
                        ` : `
                            <div style="max-height: 300px; overflow-y: auto;">
                                ${payments.map((p, idx) => `
                                    <div style="background: var(--bg-secondary); border-radius: 8px; padding: 14px; margin-bottom: 8px;">
                                        <div style="display: flex; justify-content: space-between; align-items: start;">
                                            <div>
                                                <div style="font-size: 18px; font-weight: 700; color: #10b981;">$${p.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                                                <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                                                    <i class="fas fa-${p.method === 'check' ? 'money-check' : p.method === 'cash' ? 'money-bill' : p.method === 'card' ? 'credit-card' : 'university'}"></i>
                                                    ${p.method || 'Unknown'} ${p.reference ? '• Ref: ' + p.reference : ''}
                                                </div>
                                            </div>
                                            <div style="text-align: right;">
                                                <div style="font-size: 13px; color: var(--text-secondary);">${new Date(p.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</div>
                                                <div style="font-size: 11px; color: var(--text-muted);">${p.recordedBy || ''}</div>
                                            </div>
                                        </div>
                                        ${p.notes ? `<div style="font-size: 12px; color: var(--text-muted); margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-color);">${p.notes}</div>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="closeLeaseModal('payment-history-modal')">Close</button>
                        ${balance > 0 ? `
                            <button class="btn-primary" onclick="closeLeaseModal('payment-history-modal'); openRecordPaymentModal('${invoiceId}');" style="background: #10b981;">
                                <i class="fas fa-plus"></i> Add Payment
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('active'), 10);
        }

        // Handle camera capture for invoice
        function handleInvoiceCameraCapture(input) {
            if (input.files && input.files[0]) {
                const file = input.files[0];
                const preview = document.getElementById('invoice-preview');
                const pdfPreview = document.getElementById('invoice-pdf-preview');

                // Show image preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 8px;">`;
                    if (pdfPreview) pdfPreview.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        }

        // OpenAI API for Invoice Image Analysis
        async function scanInvoiceWithAI() {
            // Check both file input and camera input
            const fileInput = document.getElementById('invoice-photo');
            const cameraInput = document.getElementById('invoice-camera');

            let file = null;
            if (fileInput && fileInput.files && fileInput.files[0]) {
                file = fileInput.files[0];
            } else if (cameraInput && cameraInput.files && cameraInput.files[0]) {
                file = cameraInput.files[0];
            }

            if (!file) {
                alert('Please upload an invoice image or take a photo first.');
                return;
            }
            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

            if (isPdf) {
                alert('PDF scanning is not supported yet. Please upload an image file (JPG, PNG, etc.).');
                return;
            }

            // Show loading state
            const scanBtn = document.getElementById('ai-scan-btn');
            const originalText = scanBtn ? scanBtn.innerHTML : '';
            if (scanBtn) {
                scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
                scanBtn.disabled = true;
            }

            try {
                // Convert image to base64
                const base64Image = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                // Get API key from settings
                const apiKey = getOpenAIKey();
                if (!apiKey) {
                    alert('Please configure your OpenAI API key in Project Analytics > Settings (key icon)');
                    return;
                }

                // Call OpenAI API
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + apiKey
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o',
                        max_tokens: 1024,
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    {
                                        type: 'image_url',
                                        image_url: {
                                            url: base64Image
                                        }
                                    },
                                    {
                                        type: 'text',
                                        text: `Analyze this invoice/bill image and extract the following information. Return ONLY a JSON object with these fields (use null for any field you cannot find):

{
    "invoiceNumber": "the invoice number, receipt number, or bill number",
    "total": "the total amount as a number (no currency symbols)",
    "date": "the date in YYYY-MM-DD format",
    "vendor": "the vendor, company, or seller name",
    "category": "one of: utilities, rent, supplies, inventory, services, equipment, other",
    "status": "paid or pending (based on whether it shows as paid/completed)",
    "description": "a brief description of what this invoice is for"
}

Return ONLY the JSON object, no additional text.`
                                    }
                                ]
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'API request failed');
                }

                const data = await response.json();
                const content = data.choices[0].message.content;

                // Parse the JSON response
                let invoiceData;
                try {
                    // Try to extract JSON from the response (in case there's extra text)
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        invoiceData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found in response');
                    }
                } catch (parseError) {
                    console.error('Error parsing AI response:', content);
                    throw new Error('Could not parse invoice data from AI response');
                }

                // Fill in the form fields
                if (invoiceData.invoiceNumber) {
                    document.getElementById('invoice-number').value = invoiceData.invoiceNumber;
                }
                if (invoiceData.vendor) {
                    document.getElementById('invoice-vendor').value = invoiceData.vendor;
                }
                if (invoiceData.category) {
                    const categorySelect = document.getElementById('invoice-category');
                    const categoryValue = invoiceData.category.toLowerCase();
                    // Find matching option
                    for (let option of categorySelect.options) {
                        if (option.value.toLowerCase() === categoryValue) {
                            categorySelect.value = option.value;
                            break;
                        }
                    }
                }
                if (invoiceData.total) {
                    const amount = parseFloat(invoiceData.total.toString().replace(/[^0-9.]/g, ''));
                    if (!isNaN(amount)) {
                        document.getElementById('invoice-amount').value = amount.toFixed(2);
                    }
                }
                if (invoiceData.date) {
                    document.getElementById('invoice-due-date').value = invoiceData.date;
                }
                if (invoiceData.status) {
                    const statusSelect = document.getElementById('invoice-status');
                    const statusValue = invoiceData.status.toLowerCase();
                    if (statusValue === 'paid') {
                        statusSelect.value = 'paid';
                    } else {
                        statusSelect.value = 'pending';
                    }
                }
                if (invoiceData.description) {
                    document.getElementById('invoice-description').value = invoiceData.description;
                }

                // Show success message
                alert('Invoice scanned successfully! Please review and adjust the extracted information as needed.');

            } catch (error) {
                console.error('Error scanning invoice:', error);
                alert('Error scanning invoice: ' + error.message);
            } finally {
                if (scanBtn) {
                    scanBtn.innerHTML = originalText || '<i class="fas fa-magic"></i> Scan with AI';
                    scanBtn.disabled = false;
                }
            }
        }

        // Open PDF in a new browser tab
        function openPdfInNewTab(base64Data) {
            // Create a blob from the base64 data
            try {
                const byteCharacters = atob(base64Data.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const blobUrl = URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
            } catch (error) {
                console.error('Error opening PDF:', error);
                // Fallback to direct base64 URL
                window.open(base64Data, '_blank');
            }
        }

        // Download PDF file
        function downloadPdf(base64Data, fileName) {
            try {
                const byteCharacters = atob(base64Data.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                // Create download link
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName || 'invoice.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            } catch (error) {
                console.error('Error downloading PDF:', error);
                alert('Error downloading PDF. Please try the "Open in Tab" option instead.');
            }
        }

        // Invoice Image Zoom Controls
        let invoiceZoomLevel = 1;
        let isImageDragging = false;
        let imageDragStartX = 0;
        let imageDragStartY = 0;
        let imageTranslateX = 0;
        let imageTranslateY = 0;
        let imageStartTranslateX = 0;
        let imageStartTranslateY = 0;

        function zoomInvoiceImage(delta) {
            const img = document.getElementById('invoice-zoom-image');
            const zoomDisplay = document.getElementById('invoice-zoom-level');

            if (!img) return;

            // Calculate new zoom level (min 0.5, max 4)
            const newZoom = Math.max(0.5, Math.min(4, invoiceZoomLevel + delta));

            // If zooming out to 1 or less, reset position
            if (newZoom <= 1) {
                imageTranslateX = 0;
                imageTranslateY = 0;
            }

            invoiceZoomLevel = newZoom;

            // Apply zoom with transform
            img.style.transform = `scale(${invoiceZoomLevel}) translate(${imageTranslateX}px, ${imageTranslateY}px)`;

            // Update display
            if (zoomDisplay) {
                zoomDisplay.textContent = `${Math.round(invoiceZoomLevel * 100)}%`;
            }

            // Update cursor based on zoom level
            img.style.cursor = invoiceZoomLevel > 1 ? 'grab' : 'default';
        }

        function resetInvoiceZoom() {
            const img = document.getElementById('invoice-zoom-image');
            const zoomDisplay = document.getElementById('invoice-zoom-level');

            if (!img) return;

            invoiceZoomLevel = 1;
            imageTranslateX = 0;
            imageTranslateY = 0;
            img.style.transform = 'scale(1) translate(0px, 0px)';
            img.style.cursor = 'default';

            if (zoomDisplay) {
                zoomDisplay.textContent = '100%';
            }
        }

        function startImageDrag(event) {
            const img = document.getElementById('invoice-zoom-image');
            if (!img || invoiceZoomLevel <= 1) return;

            isImageDragging = true;
            img.style.cursor = 'grabbing';
            img.style.transition = 'none'; // Disable transition during drag for smooth movement
            imageDragStartX = event.clientX;
            imageDragStartY = event.clientY;
            imageStartTranslateX = imageTranslateX;
            imageStartTranslateY = imageTranslateY;
            event.preventDefault();

            // Add document-level listeners so dragging continues even outside the image
            document.addEventListener('mousemove', dragImage);
            document.addEventListener('mouseup', stopImageDrag);
        }

        function dragImage(event) {
            if (!isImageDragging) return;

            const img = document.getElementById('invoice-zoom-image');
            if (!img) return;

            // Calculate delta and apply to translate (divide by zoom to keep movement proportional)
            const deltaX = (event.clientX - imageDragStartX) / invoiceZoomLevel;
            const deltaY = (event.clientY - imageDragStartY) / invoiceZoomLevel;

            imageTranslateX = imageStartTranslateX + deltaX;
            imageTranslateY = imageStartTranslateY + deltaY;

            img.style.transform = `scale(${invoiceZoomLevel}) translate(${imageTranslateX}px, ${imageTranslateY}px)`;
        }

        function stopImageDrag() {
            const img = document.getElementById('invoice-zoom-image');
            if (img) {
                img.style.cursor = invoiceZoomLevel > 1 ? 'grab' : 'default';
                img.style.transition = 'transform 0.15s ease'; // Re-enable smooth transition
            }
            isImageDragging = false;

            // Remove document-level listeners
            document.removeEventListener('mousemove', dragImage);
            document.removeEventListener('mouseup', stopImageDrag);
        }

        function openInvoiceImageFullSize() {
            const img = document.getElementById('invoice-zoom-image');
            if (!img || !img.src) return;

            const base64Data = img.src;

            // Check if it's a base64 image
            if (base64Data.startsWith('data:image')) {
                // Convert base64 to blob and open in new tab
                try {
                    const parts = base64Data.split(',');
                    const mimeMatch = parts[0].match(/:(.*?);/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
                    const byteString = atob(parts[1]);
                    const byteNumbers = new Array(byteString.length);

                    for (let i = 0; i < byteString.length; i++) {
                        byteNumbers[i] = byteString.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: mimeType });
                    const blobUrl = URL.createObjectURL(blob);

                    // Open in new tab
                    const newTab = window.open(blobUrl, '_blank');

                    // Clean up blob URL after a delay
                    if (newTab) {
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
                    }
                } catch (error) {
                    console.error('Error opening image:', error);
                    // Fallback: try opening directly
                    window.open(base64Data, '_blank');
                }
            } else {
                // It's a regular URL, just open it
                window.open(base64Data, '_blank');
            }
        }

        window.editInvoice = function(id) {
            const numericId = !isNaN(id) ? parseInt(id, 10) : id;
            const invoice = invoices.find(i => i.id === id || i.id === numericId || i.firestoreId === id);
            if (!invoice) return;

            const invoiceId = invoice.firestoreId || invoice.id;
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2>Edit Invoice</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <form id="edit-invoice-form" onsubmit="event.preventDefault(); saveInvoiceChanges('${invoiceId}');">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Invoice Number *</label>
                                <input type="text" class="form-input" id="edit-invoice-number" value="${invoice.invoiceNumber || ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Vendor *</label>
                                <input type="text" class="form-input" id="edit-invoice-vendor" value="${invoice.vendor || ''}" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Product</label>
                            <input type="text" class="form-input" id="edit-invoice-product" value="${invoice.product || ''}" placeholder="Enter product name...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Categories <span style="font-weight: 400; color: var(--text-muted); font-size: 12px;">(select one or more)</span></label>
                            ${renderInvoiceCategoryCheckboxes(invoice.categories || (invoice.category ? [invoice.category] : []), 'edit-invoice-categories-container')}
                        </div>
                        <div class="form-group">
                            <label class="form-label">Store</label>
                            <select class="form-input" id="edit-invoice-store" onchange="toggleMultipleLocations(this)">
                                <option value="" ${!invoice.store ? 'selected' : ''}>Unassigned</option>
                                <option value="All Locations" ${invoice.store === 'All Locations' ? 'selected' : ''}>All Locations</option>
                                <option value="Miramar" ${invoice.store === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                                <option value="Morena" ${invoice.store === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                                <option value="Kearny Mesa" ${invoice.store === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                                <option value="Chula Vista" ${invoice.store === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                                <option value="North Park" ${invoice.store === 'North Park' ? 'selected' : ''}>VSU North Park</option>
                                <option value="Miramar Wine & Liquor" ${invoice.store === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                                <option value="Multiple" ${invoice.store && invoice.store.includes(',') ? 'selected' : ''}>Multiple Locations...</option>
                            </select>
                            <div id="edit-invoice-stores-checkboxes" style="display: ${invoice.store && invoice.store.includes(',') ? 'block' : 'none'}; margin-top: 8px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Select locations:</p>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                        <input type="checkbox" class="invoice-store-checkbox" value="Miramar" ${invoice.store && invoice.store.includes('Miramar') && !invoice.store.includes('Wine') ? 'checked' : ''}> VSU Miramar
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                        <input type="checkbox" class="invoice-store-checkbox" value="Morena" ${invoice.store && invoice.store.includes('Morena') ? 'checked' : ''}> VSU Morena
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                        <input type="checkbox" class="invoice-store-checkbox" value="Kearny Mesa" ${invoice.store && invoice.store.includes('Kearny Mesa') ? 'checked' : ''}> VSU Kearny Mesa
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                        <input type="checkbox" class="invoice-store-checkbox" value="Chula Vista" ${invoice.store && invoice.store.includes('Chula Vista') ? 'checked' : ''}> VSU Chula Vista
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                        <input type="checkbox" class="invoice-store-checkbox" value="North Park" ${invoice.store && invoice.store.includes('North Park') ? 'checked' : ''}> VSU North Park
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
                                        <input type="checkbox" class="invoice-store-checkbox" value="Miramar Wine & Liquor" ${invoice.store && invoice.store.includes('Wine') ? 'checked' : ''}> MW&L
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Amount *</label>
                                <input type="number" step="0.01" class="form-input" id="edit-invoice-amount" value="${invoice.amount || ''}" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Invoice Date</label>
                                <input type="date" class="form-input" id="edit-invoice-date" value="${invoice.invoiceDate || ''}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Due Date</label>
                                <input type="date" class="form-input" id="edit-invoice-due-date" value="${invoice.dueDate || ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <input type="text" class="form-input" id="edit-invoice-description" value="${invoice.description || ''}">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Status</label>
                                <select class="form-input" id="edit-invoice-status">
                                    <option value="pending" ${invoice.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="partial" ${invoice.status === 'partial' ? 'selected' : ''}>Partial</option>
                                    <option value="overdue" ${invoice.status === 'overdue' ? 'selected' : ''}>Overdue</option>
                                    <option value="paid" ${invoice.status === 'paid' ? 'selected' : ''}>Paid</option>
                                    <option value="filed" ${invoice.status === 'filed' ? 'selected' : ''}>Filed</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Payment Account</label>
                                <select class="form-input" id="edit-invoice-payment-account">
                                    <option value="" ${!invoice.paymentAccount ? 'selected' : ''}>Select account...</option>
                                    <option value="Shop App" ${invoice.paymentAccount === 'Shop App' ? 'selected' : ''}>Shop App</option>
                                    <option value="Personal Account" ${invoice.paymentAccount === 'Personal Account' ? 'selected' : ''}>Personal Account</option>
                                    <option value="Business Account" ${invoice.paymentAccount === 'Business Account' ? 'selected' : ''}>Business Account</option>
                                    <option value="Zelle" ${invoice.paymentAccount === 'Zelle' ? 'selected' : ''}>Zelle</option>
                                    <option value="PayPal" ${invoice.paymentAccount === 'PayPal' ? 'selected' : ''}>PayPal</option>
                                    <option value="Credit Card" ${invoice.paymentAccount === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
                                    <option value="Cash" ${invoice.paymentAccount === 'Cash' ? 'selected' : ''}>Cash</option>
                                    <option value="Check" ${invoice.paymentAccount === 'Check' ? 'selected' : ''}>Check</option>
                                    <option value="Other" ${invoice.paymentAccount === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="edit-invoice-recurring" ${invoice.recurring ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent-primary);">
                                Recurring Invoice
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-input" id="edit-invoice-notes" rows="3">${invoice.notes || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Invoice File (Photo or PDF)</label>
                            ${invoice.photo ? `
                                <div id="edit-invoice-current-file" style="margin-bottom: 10px;">
                                    ${invoice.fileType === 'pdf' ? `
                                        <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <i class="fas fa-file-pdf" style="font-size: 32px; color: #ef4444;"></i>
                                                <div>
                                                    <div style="font-weight: 500;">${invoice.fileName || 'Invoice.pdf'}</div>
                                                    <p style="font-size: 12px; color: var(--text-muted); margin: 4px 0 0 0;">Upload new file to replace</p>
                                                </div>
                                            </div>
                                            <button type="button" onclick="window.open('${invoice.photo.replace(/'/g, "\\'")}', '_blank')" class="btn-secondary" style="padding: 8px 12px; font-size: 12px;">
                                                <i class="fas fa-external-link-alt"></i> View PDF
                                            </button>
                                        </div>
                                    ` : `
                                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                                            <img src="${invoice.photo}" alt="Current Invoice Photo" style="max-width: 150px; max-height: 100px; border-radius: 8px; object-fit: contain; cursor: pointer;" onclick="window.open('${invoice.photo.replace(/'/g, "\\'")}', '_blank')">
                                            <div>
                                                <p style="font-size: 12px; color: var(--text-muted); margin: 0 0 8px 0;">Upload new file to replace</p>
                                                <button type="button" onclick="window.open('${invoice.photo.replace(/'/g, "\\'")}', '_blank')" class="btn-secondary" style="padding: 6px 10px; font-size: 11px;">
                                                    <i class="fas fa-search-plus"></i> View Full Size
                                                </button>
                                            </div>
                                        </div>
                                    `}
                                </div>
                            ` : ''}
                            <input type="file" class="form-input" id="edit-invoice-photo" accept="image/*,.pdf,application/pdf" onchange="previewEditInvoiceFile(this)">
                            <div id="edit-invoice-photo-preview" style="margin-top: 10px; display: none;">
                                <img id="edit-invoice-photo-img" src="" alt="New Photo Preview" style="max-width: 200px; max-height: 150px; border-radius: 8px; object-fit: contain;">
                                <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">New photo preview</p>
                            </div>
                            <div id="edit-invoice-pdf-preview" style="margin-top: 10px; display: none;">
                                <div style="background: var(--bg-tertiary); padding: 12px; border-radius: 8px; display: flex; align-items: center; gap: 12px;">
                                    <i class="fas fa-file-pdf" style="font-size: 32px; color: #ef4444;"></i>
                                    <div>
                                        <div id="edit-invoice-pdf-name" style="font-weight: 500;"></div>
                                        <div id="edit-invoice-pdf-size" style="font-size: 12px; color: var(--text-muted);"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions" style="margin-top: 24px;">
                            <button type="button" class="btn-secondary" onclick="closeModal()">Close</button>
                            <button type="button" class="btn-primary" onclick="saveInvoiceChanges('${invoiceId}')">
                                <i class="fas fa-save"></i>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            `;

            modal.classList.add('active');
        }

        window.previewEditInvoiceFile = function(input) {
            const photoPreview = document.getElementById('edit-invoice-photo-preview');
            const pdfPreview = document.getElementById('edit-invoice-pdf-preview');
            const img = document.getElementById('edit-invoice-photo-img');
            const pdfName = document.getElementById('edit-invoice-pdf-name');
            const pdfSize = document.getElementById('edit-invoice-pdf-size');

            // Hide both previews initially
            if (photoPreview) photoPreview.style.display = 'none';
            if (pdfPreview) pdfPreview.style.display = 'none';

            if (input.files && input.files[0]) {
                const file = input.files[0];

                // Check if it's a PDF
                if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    // Show PDF preview
                    if (pdfPreview && pdfName && pdfSize) {
                        pdfName.textContent = file.name;
                        pdfSize.textContent = formatFileSize(file.size);
                        pdfPreview.style.display = 'block';
                    }
                } else {
                    // Show image preview
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        if (img && photoPreview) {
                            img.src = e.target.result;
                            photoPreview.style.display = 'block';
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
        }

        // Keep old function name for backwards compatibility
        window.previewEditInvoicePhoto = function(input) {
            previewEditInvoiceFile(input);
        }

        window.saveInvoiceChanges = async function(invoiceId) {
            const invoiceNumber = document.getElementById('edit-invoice-number').value.trim();
            const vendor = document.getElementById('edit-invoice-vendor').value.trim();
            const product = document.getElementById('edit-invoice-product').value.trim();
            const categories = getSelectedInvoiceCategories('edit-invoice-categories-container');
            const category = categories.length > 0 ? categories[0] : ''; // Primary category for backwards compatibility
            const store = getSelectedStores('edit') || null;
            const amount = document.getElementById('edit-invoice-amount').value;
            const description = document.getElementById('edit-invoice-description').value.trim();
            const invoiceDate = document.getElementById('edit-invoice-date').value;
            const dueDate = document.getElementById('edit-invoice-due-date').value;
            const status = document.getElementById('edit-invoice-status').value;
            const paymentAccount = document.getElementById('edit-invoice-payment-account').value;
            const recurring = document.getElementById('edit-invoice-recurring').checked;
            const notes = document.getElementById('edit-invoice-notes').value.trim();

            // Validate required fields
            if (!invoiceNumber || !vendor || !amount) {
                showNotification('Por favor completa todos los campos requeridos (Invoice #, Vendor, Amount)', 'error');
                return;
            }

            // Find the invoice to get current file data
            const numericId = !isNaN(invoiceId) ? parseInt(invoiceId, 10) : invoiceId;
            const invoice = invoices.find(i => i.id === invoiceId || i.id === numericId || i.firestoreId === invoiceId);

            // Get new file if uploaded - Upload to Firebase Storage (same as add invoice)
            const fileInput = document.getElementById('edit-invoice-photo');
            let fileUrl = invoice ? invoice.photo : null; // Keep existing file by default
            let filePath = invoice ? invoice.filePath : null;
            let fileType = invoice ? invoice.fileType : null;
            let fileName = invoice ? invoice.fileName : null;

            if (fileInput && fileInput.files && fileInput.files[0]) {
                const file = fileInput.files[0];

                // Validate file size (max 20MB for Storage)
                if (file.size > 20 * 1024 * 1024) {
                    showNotification('El archivo es muy grande. Por favor usa un archivo menor a 20MB.', 'error');
                    return;
                }

                try {
                    // Initialize storage if needed
                    if (!firebaseStorageHelper.isInitialized) {
                        firebaseStorageHelper.initialize();
                    }

                    // Determine file type
                    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                    fileType = isPdf ? 'pdf' : 'image';
                    fileName = file.name;

                    // Upload to Firebase Storage (disable overlay to prevent UI blocking)
                    const uploadResult = await firebaseStorageHelper.uploadDocument(
                        file,
                        'invoices/attachments',
                        invoiceNumber.replace(/[^a-zA-Z0-9]/g, '_') + '_',
                        false  // Don't show overlay - we use notification
                    );

                    if (!uploadResult || !uploadResult.url) {
                        throw new Error('Upload failed - no URL returned');
                    }

                    fileUrl = uploadResult.url;
                    filePath = uploadResult.path;
                } catch (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    console.error('Upload error details:', {
                        message: uploadError.message,
                        code: uploadError.code,
                        name: uploadError.name
                    });

                    // Show specific error message in Spanish
                    let errorMessage = 'Error al subir el archivo. ';
                    if (uploadError.code === 'storage/unauthorized') {
                        errorMessage += 'No tienes permiso para subir archivos. Contacta al administrador.';
                    } else if (uploadError.code === 'storage/canceled') {
                        errorMessage += 'La subida fue cancelada.';
                    } else if (uploadError.code === 'storage/unknown' || uploadError.message?.includes('Firebase Storage')) {
                        errorMessage += 'Firebase Storage no está configurado correctamente. Contacta al administrador.';
                    } else {
                        errorMessage += 'Por favor verifica tu conexión e intenta de nuevo.';
                    }

                    showNotification(errorMessage, 'error');
                    return;
                }
            }

            // Create update data object
            const updateData = {
                invoiceNumber: invoiceNumber || '',
                vendor: vendor || '',
                product: product || '',
                category: category || '', // Primary category for backwards compatibility
                categories: categories || [], // All selected categories
                store: store || null,
                description: description || '',
                amount: parseFloat(amount) || 0,
                invoiceDate: invoiceDate || '',
                dueDate: dueDate || '',
                paidDate: status === 'paid' ? (invoice && invoice.paidDate ? invoice.paidDate : new Date().toISOString().split('T')[0]) : null,
                status: status || 'pending',
                paymentAccount: paymentAccount || '',
                recurring: recurring,
                notes: notes || '',
                photo: fileUrl,           // Now stores URL instead of base64
                filePath: filePath,       // Storage path for deletion
                fileType: fileType,       // 'pdf' or 'image' or null
                fileName: fileName        // Original filename
            };

            try {
                // Update in Firebase
                if (typeof firebaseInvoiceManager !== 'undefined' && firebaseInvoiceManager.isInitialized) {
                    const success = await firebaseInvoiceManager.updateInvoice(invoiceId, updateData);
                    if (success) {
                        // Update local state
                        const idx = invoices.findIndex(i => i.id === invoiceId || i.firestoreId === invoiceId);
                        if (idx !== -1) {
                            invoices[idx] = { ...invoices[idx], ...updateData };
                        }
                        closeModal();
                        renderInvoices();
                        showNotification('Invoice updated successfully', 'success');
                    } else {
                        showNotification('Error al actualizar invoice. Por favor verifica tu conexión e intenta de nuevo.', 'error');
                    }
                } else {
                    // Fallback to local only
                    const idx = invoices.findIndex(i => i.id === invoiceId || i.firestoreId === invoiceId);
                    if (idx !== -1) {
                        invoices[idx] = { ...invoices[idx], ...updateData };
                    }
                    closeModal();
                    renderInvoices();
                    showNotification('Invoice updated locally', 'success');
                }
            } catch (error) {
                console.error('Error saving invoice changes:', error);
                showNotification('Error al guardar cambios del invoice. Por favor verifica todos los campos e intenta de nuevo.', 'error');
            }
        }

        // Export Invoices to Excel (CSV)
        function exportInvoicesToExcel() {
            const filteredInvoices = getFilteredInvoices();
            if (filteredInvoices.length === 0) {
                alert('No invoices to export');
                return;
            }

            // Create CSV content
            const headers = ['Invoice #', 'Vendor', 'Category', 'Store', 'Amount', 'Amount Paid', 'Balance', 'Status', 'Due Date', 'Paid Date', 'Notes'];
            const rows = filteredInvoices.map(inv => [
                inv.invoiceNumber || '-',
                inv.vendor || '-',
                inv.category || '-',
                inv.store || '-',
                inv.amount?.toFixed(2) || '0.00',
                (inv.amountPaid || 0).toFixed(2),
                (inv.amount - (inv.amountPaid || 0)).toFixed(2),
                inv.status || '-',
                inv.dueDate || '-',
                inv.paidDate || '-',
                (inv.notes || '').replace(/,/g, ';').replace(/\n/g, ' ')
            ]);

            let csv = headers.join(',') + '\n';
            rows.forEach(row => {
                csv += row.map(cell => `"${cell}"`).join(',') + '\n';
            });

            // Add summary
            const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.amount, 0);
            const totalPaid = filteredInvoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
            csv += '\n"TOTAL","","","","' + totalAmount.toFixed(2) + '","' + totalPaid.toFixed(2) + '","' + (totalAmount - totalPaid).toFixed(2) + '","","","",""';

            // Download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const date = new Date().toISOString().split('T')[0];
            link.download = `invoices_${invoiceFilters.store || 'all'}_${date}.csv`;
            link.click();
        }

        // Export Invoices to PDF
        function exportInvoicesToPDF() {
            const filteredInvoices = getFilteredInvoices();
            if (filteredInvoices.length === 0) {
                alert('No invoices to export');
                return;
            }

            // Calculate totals
            const totalAmount = filteredInvoices.reduce((sum, i) => sum + i.amount, 0);
            const totalPaid = filteredInvoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
            const totalPending = totalAmount - totalPaid;

            // Create printable HTML
            const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoices Report</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #6366f1; padding-bottom: 20px; }
                        .header h1 { font-size: 28px; color: #1f2937; margin-bottom: 8px; }
                        .header p { color: #6b7280; font-size: 14px; }
                        .summary { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f3f4f6; padding: 20px; border-radius: 8px; }
                        .summary-item { text-align: center; }
                        .summary-item .label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 4px; }
                        .summary-item .value { font-size: 24px; font-weight: bold; }
                        .summary-item .value.green { color: #10b981; }
                        .summary-item .value.red { color: #ef4444; }
                        .summary-item .value.blue { color: #6366f1; }
                        table { width: 100%; border-collapse: collapse; font-size: 12px; }
                        th { background: #6366f1; color: white; padding: 12px 8px; text-align: left; font-weight: 600; }
                        td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
                        tr:nth-child(even) { background: #f9fafb; }
                        .status { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
                        .status.paid { background: #d1fae5; color: #065f46; }
                        .status.pending { background: #fef3c7; color: #92400e; }
                        .status.overdue { background: #fee2e2; color: #991b1b; }
                        .status.partial { background: #dbeafe; color: #1e40af; }
                        .footer { margin-top: 30px; text-align: center; color: #9ca3af; font-size: 11px; }
                        .amount { text-align: right; font-family: monospace; }
                        @media print { body { padding: 20px; } }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Invoices Report</h1>
                        <p>${invoiceFilters.store && invoiceFilters.store !== 'all' ? invoiceFilters.store + ' - ' : ''}Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    <div class="summary">
                        <div class="summary-item">
                            <div class="label">Total Invoices</div>
                            <div class="value blue">${filteredInvoices.length}</div>
                        </div>
                        <div class="summary-item">
                            <div class="label">Total Amount</div>
                            <div class="value">$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div class="summary-item">
                            <div class="label">Total Paid</div>
                            <div class="value green">$${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div class="summary-item">
                            <div class="label">Balance Due</div>
                            <div class="value red">$${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Vendor</th>
                                <th>Category</th>
                                <th>Store</th>
                                <th style="text-align: right;">Amount</th>
                                <th style="text-align: right;">Paid</th>
                                <th style="text-align: right;">Balance</th>
                                <th>Status</th>
                                <th>Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredInvoices.map(inv => `
                                <tr>
                                    <td>${inv.invoiceNumber || '-'}</td>
                                    <td>${inv.vendor || '-'}</td>
                                    <td>${inv.category || '-'}</td>
                                    <td>${inv.store || '-'}</td>
                                    <td class="amount">$${inv.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</td>
                                    <td class="amount">$${(inv.amountPaid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td class="amount">$${(inv.amount - (inv.amountPaid || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td><span class="status ${inv.status}">${inv.status}</span></td>
                                    <td>${inv.dueDate || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="footer">
                        <p>Ascendance - Invoice Management System</p>
                    </div>
                </body>
                </html>
            `;

            // Open print window
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.onload = function() {
                printWindow.print();
            };
        }

        // Load invoices from Firebase
        async function loadInvoicesFromFirebase() {
            try {
                if (typeof firebaseInvoiceManager === 'undefined') {
                    console.log('Firebase Invoice Manager not available');
                    return;
                }

                if (!firebaseInvoiceManager.isInitialized) {
                    await firebaseInvoiceManager.initialize();
                }

                const firebaseInvoices = await firebaseInvoiceManager.loadInvoices();

                if (firebaseInvoices.length > 0) {
                    // Replace local invoices with Firebase data
                    invoices = firebaseInvoices;
                }
            } catch (error) {
                console.error('Error loading invoices from Firebase:', error);
            }
        }

        // Treasury Functions
        async function loadTreasuryItemsFromFirebase() {
            try {
                console.log('🔄 Loading treasury from Firebase...');
                if (typeof firebase === 'undefined' || !firebase.firestore) {
                    console.warn('⚠️ Firebase not available for treasury');
                    return false;
                }

                const db = firebase.firestore();
                const treasuryCollection = window.FIREBASE_COLLECTIONS?.treasury || 'treasury';
                
                const snapshot = await db.collection(treasuryCollection).get();
                const items = [];
                
                snapshot.forEach(doc => {
                    items.push({
                        id: items.length > 0 ? Math.max(...items.map(i => i.id || 0)) + 1 : 1,
                        firestoreId: doc.id,
                        ...doc.data()
                    });
                });

                treasuryItems = items;
                return true;
            } catch (error) {
                console.error('❌ Error loading treasury items from Firebase:', error);
                return false;
            }
        }

        function renderTreasury() {
            console.log('🚀 renderTreasury called');
            const dashboard = document.querySelector('.dashboard');

            // Show loading state immediately
            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Heady Pieces - Select Collection</h2>
                        <p class="section-subtitle">Manage your valuable collection</p>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; color: var(--text-muted);">
                    <div style="width: 50px; height: 50px; border: 3px solid var(--border-color); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
                    <p style="font-size: 16px; font-weight: 500;">Loading Heady Pieces...</p>
                    <p style="font-size: 13px; margin-top: 8px;">Fetching collection from database</p>
                </div>
                <style>
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                </style>
            `;

            // Load from Firebase first
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                loadTreasuryItemsFromFirebase().then(() => {
                    console.log('📊 Firebase load complete, rendering content');
                    renderTreasuryContent();
                }).catch(error => {
                    console.error('❌ Error in renderTreasury:', error);
                    renderTreasuryContent(); // Still render even if Firebase fails
                });
            } else {
                console.warn('⚠️ Firebase not initialized, rendering with local data');
                // If Firebase not available, just render with existing data
                renderTreasuryContent();
            }
        }

        let treasuryViewMode = 'grid'; // 'grid' or 'list'
        let treasuryFilterLocation = 'all';
        let treasuryFilterArtist = 'all';

        function renderTreasuryContent() {
            console.log('📝 renderTreasuryContent called with', treasuryItems.length, 'items');
            const dashboard = document.querySelector('.dashboard');

            if (!dashboard) {
                console.error('❌ Dashboard element not found!');
                return;
            }

            const totalValue = treasuryItems.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0);
            const itemsByLocation = {
                'VSU Kearny Mesa': treasuryItems.filter(i => i.location === 'VSU Kearny Mesa').length,
                'VSU Miramar': treasuryItems.filter(i => i.location === 'VSU Miramar').length,
                'VSU Morena': treasuryItems.filter(i => i.location === 'VSU Morena').length,
                'VSU North Park': treasuryItems.filter(i => i.location === 'VSU North Park').length,
                'VSU Chula Vista': treasuryItems.filter(i => i.location === 'VSU Chula Vista').length
            };

            // Get unique artists
            const artists = [...new Set(treasuryItems.map(i => i.artist).filter(a => a && a.trim()))].sort();

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Heady Pieces - Select Collection</h2>
                        <p class="section-subtitle">Manage your valuable collection</p>
                    </div>
                    <button class="btn-primary floating-add-btn" onclick="openModal('add-treasury')">
                        <i class="fas fa-plus"></i>
                        Add Piece
                    </button>
                </div>

                <div class="treasury-stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px;">
                    <div class="stat-card" style="background: linear-gradient(135deg, var(--accent-primary) 0%, #818cf8 100%); text-align: center; padding: 28px 20px;">
                        <div class="stat-icon" style="margin: 0 auto 12px; background: rgba(255, 255, 255, 0.2); width: 50px; height: 50px;"><i class="fas fa-vault"></i></div>
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Total Value</div>
                            <div class="stat-value" style="color: white; font-size: 24px;">$${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); text-align: center; padding: 28px 20px;">
                        <div class="stat-icon" style="margin: 0 auto 12px; background: rgba(255, 255, 255, 0.2); width: 50px; height: 50px;"><i class="fas fa-gem"></i></div>
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Total Pieces</div>
                            <div class="stat-value" style="color: white; font-size: 24px;">${treasuryItems.length}</div>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align: center; padding: 28px 20px;">
                        <div class="stat-icon" style="margin: 0 auto 12px; background: rgba(255, 255, 255, 0.2); width: 50px; height: 50px;"><i class="fas fa-palette"></i></div>
                        <div class="stat-content">
                            <div class="stat-label" style="color: rgba(255, 255, 255, 0.9);">Artists</div>
                            <div class="stat-value" style="color: white; font-size: 24px;">${artists.length}</div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                        <h3 class="card-title">
                            <i class="fas fa-images"></i>
                            Collection Inventory
                        </h3>
                        <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                            <!-- View Toggle -->
                            <div style="display: flex; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden;">
                                <button onclick="switchTreasuryView('grid')" id="treasury-grid-btn" style="padding: 8px 14px; border: none; background: ${treasuryViewMode === 'grid' ? 'var(--accent-primary)' : 'var(--bg-secondary)'}; color: ${treasuryViewMode === 'grid' ? 'white' : 'var(--text-primary)'}; cursor: pointer; transition: all 0.2s;">
                                    <i class="fas fa-th-large"></i>
                                </button>
                                <button onclick="switchTreasuryView('list')" id="treasury-list-btn" style="padding: 8px 14px; border: none; background: ${treasuryViewMode === 'list' ? 'var(--accent-primary)' : 'var(--bg-secondary)'}; color: ${treasuryViewMode === 'list' ? 'white' : 'var(--text-primary)'}; cursor: pointer; transition: all 0.2s;">
                                    <i class="fas fa-list"></i>
                                </button>
                            </div>
                            <!-- Artist Filter -->
                            <select class="form-input" style="width: 180px;" onchange="filterTreasuryByArtist(this.value)" id="treasury-artist-filter">
                                <option value="all">All Artists</option>
                                ${artists.map(a => `<option value="${a}" ${treasuryFilterArtist === a ? 'selected' : ''}>${a}</option>`).join('')}
                            </select>
                            <!-- Location Filter -->
                            <select class="form-input" style="width: 180px;" onchange="filterTreasuryByLocation(this.value)" id="treasury-location-filter">
                                <option value="all">All Locations</option>
                                <option value="VSU Miramar" ${treasuryFilterLocation === 'VSU Miramar' ? 'selected' : ''}>VSU Miramar (${itemsByLocation['VSU Miramar']})</option>
                                <option value="VSU Morena" ${treasuryFilterLocation === 'VSU Morena' ? 'selected' : ''}>VSU Morena (${itemsByLocation['VSU Morena']})</option>
                                <option value="VSU Kearny Mesa" ${treasuryFilterLocation === 'VSU Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa (${itemsByLocation['VSU Kearny Mesa']})</option>
                                <option value="VSU Chula Vista" ${treasuryFilterLocation === 'VSU Chula Vista' ? 'selected' : ''}>VSU Chula Vista (${itemsByLocation['VSU Chula Vista']})</option>
                                <option value="VSU North Park" ${treasuryFilterLocation === 'VSU North Park' ? 'selected' : ''}>VSU North Park (${itemsByLocation['VSU North Park']})</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-body" id="treasury-content-area">
                        ${treasuryViewMode === 'grid' ? renderTreasuryGrid() : renderTreasuryList()}
                    </div>
                </div>
            `;
        }

        function renderTreasuryGrid() {
            const filteredItems = getFilteredTreasuryItems();

            if (filteredItems.length === 0) {
                return `
                    <div style="text-align: center; padding: 60px; color: var(--text-muted);">
                        <i class="fas fa-gem" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                        <p>No pieces found</p>
                    </div>
                `;
            }

            return `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; padding: 20px;">
                    ${filteredItems.map(item => {
                        // Use thumbnail for grid (faster loading), fallback to full image if no thumbnail
                        const itemThumbnail = item.thumbnail || item.image || (item.photos && item.photos.length > 0 ? item.photos[0] : null);
                        const itemValue = parseFloat(item.value) || 0;
                        const itemName = item.artworkName || 'Unknown';
                        const itemArtist = item.artist || 'Unknown Artist';

                        return `
                            <div onclick="viewTreasuryItem('${item.firestoreId || item.id}')" style="background: var(--bg-secondary); border-radius: 16px; overflow: hidden; cursor: pointer; transition: all 0.3s; border: 2px solid transparent;"
                                onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 16px 32px rgba(0,0,0,0.15)'; this.style.borderColor='var(--accent-primary)';"
                                onmouseout="this.style.transform='none'; this.style.boxShadow='none'; this.style.borderColor='transparent';">
                                <div style="height: 180px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;">
                                    ${itemThumbnail
                                        ? `<div class="treasury-img-placeholder"></div><img src="${itemThumbnail}" loading="lazy" class="treasury-lazy-img" onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none';" style="width: 100%; height: 100%; object-fit: cover;" alt="${itemName}">`
                                        : `<i class="fas fa-image" style="font-size: 48px; color: var(--text-muted); opacity: 0.3;"></i>`
                                    }
                                </div>
                                <div style="padding: 16px;">
                                    <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${itemName}</div>
                                    <div style="font-size: 13px; color: var(--accent-primary); margin-bottom: 8px;"><i class="fas fa-palette" style="margin-right: 6px;"></i>${itemArtist}</div>
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="font-size: 18px; font-weight: 700; color: #10b981;">$${itemValue.toLocaleString()}</span>
                                        <span style="font-size: 11px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; color: var(--text-muted);">${item.location || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        function renderTreasuryList() {
            const filteredItems = getFilteredTreasuryItems();

            if (filteredItems.length === 0) {
                return `
                    <div style="text-align: center; padding: 60px; color: var(--text-muted);">
                        <i class="fas fa-gem" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                        <p>No pieces found</p>
                    </div>
                `;
            }

            return `
                <table class="data-table treasury-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="width: 80px;">Photo</th>
                            <th>Artwork Name</th>
                            <th>Artist</th>
                            <th>Acquisition Date</th>
                            <th>Value (USD)</th>
                            <th>Location</th>
                            <th style="width: 120px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredItems.map(item => {
                            // Use thumbnail for list (faster loading), fallback to full image if no thumbnail
                            const itemThumbnail = item.thumbnail || item.image || (item.photos && item.photos.length > 0 ? item.photos[0] : null);
                            const photoDisplay = itemThumbnail
                                ? `<div class="treasury-img-placeholder small"></div><img src="${itemThumbnail}" loading="lazy" class="treasury-lazy-img" onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none';" style="width: 100%; height: 100%; object-fit: cover;" alt="${item.artworkName}">`
                                : `<i class="fas fa-gem" style="color: var(--text-muted); font-size: 24px;"></i>`;

                            const itemValue = parseFloat(item.value) || 0;
                            const itemName = item.artworkName || 'Unknown';
                            const itemArtist = item.artist || '-';
                            const itemDate = item.acquisitionDate || '-';
                            const itemLocation = item.location || 'Unknown';

                            return `
                                <tr>
                                    <td data-label="Photo">
                                        <div style="width: 60px; height: 60px; border-radius: 8px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border-color); position: relative;">
                                            ${photoDisplay}
                                        </div>
                                    </td>
                                    <td data-label="Artwork Name"><strong>${itemName}</strong></td>
                                    <td data-label="Artist">${itemArtist}</td>
                                    <td data-label="Acquisition Date">${formatDate(itemDate)}</td>
                                    <td data-label="Value" style="font-weight: 600; color: var(--success);">$${itemValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                    <td data-label="Location">
                                        <span class="badge" style="background: var(--accent-primary);">${itemLocation}</span>
                                    </td>
                                    <td data-label="Actions">
                                        <button class="btn-icon" onclick="viewTreasuryItem('${item.firestoreId || item.id}')" title="View Details">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn-icon" onclick="editTreasuryItem('${item.firestoreId || item.id}')" title="Edit">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon" onclick="deleteTreasuryItem('${item.firestoreId || item.id}')" title="Delete">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
        }

        function getFilteredTreasuryItems() {
            return treasuryItems.filter(item => {
                const locationMatch = treasuryFilterLocation === 'all' || item.location === treasuryFilterLocation;
                const artistMatch = treasuryFilterArtist === 'all' || item.artist === treasuryFilterArtist;
                return locationMatch && artistMatch;
            });
        }

        window.switchTreasuryView = function(mode) {
            treasuryViewMode = mode;
            const contentArea = document.getElementById('treasury-content-area');
            const gridBtn = document.getElementById('treasury-grid-btn');
            const listBtn = document.getElementById('treasury-list-btn');

            if (contentArea) {
                contentArea.innerHTML = mode === 'grid' ? renderTreasuryGrid() : renderTreasuryList();
            }
            if (gridBtn && listBtn) {
                gridBtn.style.background = mode === 'grid' ? 'var(--accent-primary)' : 'var(--bg-secondary)';
                gridBtn.style.color = mode === 'grid' ? 'white' : 'var(--text-primary)';
                listBtn.style.background = mode === 'list' ? 'var(--accent-primary)' : 'var(--bg-secondary)';
                listBtn.style.color = mode === 'list' ? 'white' : 'var(--text-primary)';
            }
        }

        window.filterTreasuryByLocation = function(location) {
            treasuryFilterLocation = location;
            const contentArea = document.getElementById('treasury-content-area');
            if (contentArea) {
                contentArea.innerHTML = treasuryViewMode === 'grid' ? renderTreasuryGrid() : renderTreasuryList();
            }
        }

        window.filterTreasuryByArtist = function(artist) {
            treasuryFilterArtist = artist;
            const contentArea = document.getElementById('treasury-content-area');
            if (contentArea) {
                contentArea.innerHTML = treasuryViewMode === 'grid' ? renderTreasuryGrid() : renderTreasuryList();
            }
        }

        function viewTreasuryItem(id) {
            const item = treasuryItems.find(t => t.firestoreId === id || t.id === id);
            if (!item) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            // Support both 'image' field and legacy 'photos' array
            const itemImage = item.image || (item.photos && item.photos.length > 0 ? item.photos[0] : null);
            const imageDisplay = itemImage
                ? `<div style="position: relative; min-height: 200px;"><div class="treasury-img-placeholder large"></div><img src="${itemImage}" loading="lazy" class="treasury-lazy-img" onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none';" style="width: 100%; max-height: 300px; object-fit: contain; border-radius: 12px;" alt="${item.artworkName}"></div>`
                : `<div style="text-align: center; padding: 60px; background: var(--bg-secondary); border-radius: 12px; color: var(--text-muted);">
                    <i class="fas fa-gem" style="font-size: 64px; margin-bottom: 16px; display: block;"></i>
                    No image available
                </div>`;

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-gem"></i> ${item.artworkName}</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 24px; text-align: center;">
                        ${imageDisplay}
                    </div>

                    <div class="card" style="margin-bottom: 16px;">
                        <div class="card-body">
                            <h4 style="margin: 0 0 16px; font-size: 14px; color: var(--text-muted);">Piece Information</h4>
                            <div class="treasury-info-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px; margin-bottom: 16px;">
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Artist</label>
                                    <div style="font-weight: 500;">${item.artist || 'Unknown'}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Acquisition Date</label>
                                    <div>${formatDate(item.acquisitionDate) || '-'}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Estimated Value</label>
                                    <div style="font-weight: 600; color: var(--success); font-size: 18px;">$${(parseFloat(item.value) || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Current Location</label>
                                    <div><span class="badge" style="background: var(--accent-primary);">${item.location || 'Unknown'}</span></div>
                                </div>
                            </div>

                            ${item.description ? `
                                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px;">Description</label>
                                    <p style="margin: 0; line-height: 1.6; color: var(--text-secondary);">${item.description}</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="treasury-modal-actions" style="display: flex; gap: 12px;">
                        <button class="btn-secondary" style="flex: 1;" onclick="editTreasuryItem('${item.firestoreId || item.id}')">
                            <i class="fas fa-edit"></i>
                            Edit Piece
                        </button>
                        <button class="btn-secondary" style="flex: 1; background: var(--danger); color: white; border-color: var(--danger);" onclick="closeModal(); deleteTreasuryItem('${item.firestoreId || item.id}');">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;

            modal.classList.add('active');
        }

        function editTreasuryItem(id) {
            closeModal();
            setTimeout(() => openModal('edit-treasury', id), 100);
        }

        async function deleteTreasuryItem(id) {
            showConfirmModal({
                title: 'Delete Heady Piece',
                message: 'Are you sure you want to delete this piece from the collection? This action cannot be undone.',
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    try {
                        // Find the item to get firestoreId
                        const item = treasuryItems.find(t => t.firestoreId === id || t.id === id);

                        // Delete from Firebase if firestoreId exists
                        if (item && item.firestoreId && typeof firebase !== 'undefined' && firebase.firestore) {
                            const db = firebase.firestore();
                            const treasuryCollection = window.FIREBASE_COLLECTIONS?.treasury || 'treasury';
                            await db.collection(treasuryCollection).doc(item.firestoreId).delete();
                        }

                        // Remove from local array
                        treasuryItems = treasuryItems.filter(t => t.firestoreId !== id && t.id !== id);

                        await loadTreasuryItemsFromFirebase();
                        renderTreasuryContent();
                    } catch (error) {
                        console.error('Error deleting treasury item:', error);
                        showNotification('Error deleting item. Please try again.', 'error');
                    }
                }
            });
        }

        /**
         * Preview treasury image before upload
         */
        function previewTreasuryImage(input) {
            const preview = document.getElementById('treasury-image-preview');
            if (!preview) return;

            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    preview.removeAttribute('data-removed');
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        /**
         * Remove treasury image from preview
         */
        function removeTreasuryImage() {
            const preview = document.getElementById('treasury-image-preview');
            const input = document.getElementById('treasury-image');

            if (preview) {
                preview.innerHTML = `<i class="fas fa-gem" style="font-size: 36px; color: var(--text-muted);"></i>`;
                preview.setAttribute('data-removed', 'true');
            }
            if (input) {
                input.value = '';
            }
        }

        async function saveTreasuryItem(isEdit = false, itemId = null) {
            const artworkName = document.getElementById('treasury-artwork-name').value.trim();
            const artist = document.getElementById('treasury-artist').value.trim();
            const acquisitionDate = document.getElementById('treasury-acquisition-date').value;
            const value = parseFloat(document.getElementById('treasury-value').value) || 0;
            const location = document.getElementById('treasury-location').value;
            const description = document.getElementById('treasury-description').value.trim();

            // Get the image
            const imageInput = document.getElementById('treasury-image');
            const imagePreview = document.getElementById('treasury-image-preview');

            // Determine image value - now with thumbnail support
            let imageUrl = null;
            let thumbnailUrl = null;
            const wasRemoved = imagePreview?.getAttribute('data-removed') === 'true';

            if (wasRemoved) {
                // Image was explicitly removed
                imageUrl = null;
                thumbnailUrl = null;
            } else if (imageInput?.files && imageInput.files.length > 0) {
                // New image uploaded - upload both original and thumbnail to Firebase Storage
                const rawBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(imageInput.files[0]);
                });
                try {
                    const baseFileName = `treasury-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                    // Generate thumbnail (300px, quality 0.7)
                    const thumbnailBase64 = await generateThumbnail(rawBase64, 300, 0.7);

                    // Upload both in parallel for speed
                    const [originalUrl, thumbUrl] = await Promise.all([
                        uploadImageToFirebaseStorage(rawBase64, `treasury/${baseFileName}.jpg`),
                        uploadImageToFirebaseStorage(thumbnailBase64, `treasury/thumbnails/${baseFileName}_thumb.jpg`)
                    ]);

                    imageUrl = originalUrl;
                    thumbnailUrl = thumbUrl;
                } catch (err) {
                    console.error('Error uploading treasury image:', err);
                    showNotification('Error uploading image to Firebase Storage', 'error');
                    return;
                }
            } else if (isEdit) {
                // Keep existing images
                const existingItem = treasuryItems.find(t => t.firestoreId === itemId || t.id === itemId);
                imageUrl = existingItem?.image || (existingItem?.photos && existingItem.photos.length > 0 ? existingItem.photos[0] : null);
                thumbnailUrl = existingItem?.thumbnail || null;
            }

            if (!artworkName || !location) {
                alert('Please fill in at least the artwork name and location');
                return;
            }

            try {
                if (isEdit) {
                    const item = treasuryItems.find(t => t.firestoreId === itemId || t.id === itemId);
                    if (item) {
                        item.artworkName = artworkName;
                        item.artist = artist;
                        item.acquisitionDate = acquisitionDate;
                        item.value = value;
                        item.location = location;
                        item.description = description;
                        item.image = imageUrl;
                        item.thumbnail = thumbnailUrl;

                        // Update in Firebase
                        if (typeof firebase !== 'undefined' && firebase.firestore) {
                            const db = firebase.firestore();
                            const treasuryCollection = window.FIREBASE_COLLECTIONS?.treasury || 'treasury';

                            // Use firestoreId if available, otherwise create new
                            if (item.firestoreId) {
                                await db.collection(treasuryCollection).doc(item.firestoreId).update({
                                    artworkName,
                                    artist,
                                    acquisitionDate,
                                    value,
                                    location,
                                    description,
                                    image: imageUrl,
                                    thumbnail: thumbnailUrl,
                                    updatedAt: new Date()
                                });
                            } else {
                                // If no firestoreId, save as new
                                const docRef = await db.collection(treasuryCollection).add({
                                    artworkName,
                                    artist,
                                    acquisitionDate,
                                    value,
                                    location,
                                    description,
                                    image: imageUrl,
                                    thumbnail: thumbnailUrl,
                                    createdAt: new Date(),
                                    updatedAt: new Date()
                                });
                                item.firestoreId = docRef.id;
                            }
                        }
                    }
                } else {
                    const newItem = {
                        id: treasuryItems.length > 0 ? Math.max(...treasuryItems.map(t => t.id)) + 1 : 1,
                        artworkName,
                        artist,
                        acquisitionDate,
                        value,
                        location,
                        description,
                        image: imageUrl,
                        thumbnail: thumbnailUrl
                    };

                    // Save to Firebase
                    if (typeof firebase !== 'undefined' && firebase.firestore) {
                        const db = firebase.firestore();
                        const treasuryCollection = window.FIREBASE_COLLECTIONS?.treasury || 'treasury';

                        const docRef = await db.collection(treasuryCollection).add({
                            artworkName,
                            artist,
                            acquisitionDate,
                            value,
                            location,
                            description,
                            image: imageUrl,
                            thumbnail: thumbnailUrl,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                        newItem.firestoreId = docRef.id;
                    }

                    treasuryItems.push(newItem);
                }

                closeModal();
                await loadTreasuryItemsFromFirebase();
                renderTreasuryContent();
            } catch (error) {
                console.error('Error saving treasury item:', error);
                alert('Error saving treasury item. Please try again.');
            }
        }

        // Change Functions - Daily Change Register
        const CHANGE_DENOMINATIONS = {
            coins: [
                { id: 'pennies', label: 'Pennies', value: 0.01, icon: '1¢' },
                { id: 'nickels', label: 'Nickels', value: 0.05, icon: '5¢' },
                { id: 'dimes', label: 'Dimes', value: 0.10, icon: '10¢' },
                { id: 'quarters', label: 'Quarters', value: 0.25, icon: '25¢' },
                { id: 'dollars_coin', label: 'Dollar Coins', value: 1.00, icon: '$1' }
            ],
            bills: [
                { id: 'ones', label: '$1 Bills', value: 1, icon: '$1' },
                { id: 'fives', label: '$5 Bills', value: 5, icon: '$5' },
                { id: 'tens', label: '$10 Bills', value: 10, icon: '$10' },
                { id: 'twenties', label: '$20 Bills', value: 20, icon: '$20' },
                { id: 'fifties', label: '$50 Bills', value: 50, icon: '$50' },
                { id: 'hundreds', label: '$100 Bills', value: 100, icon: '$100' }
            ]
        };

        let changeFilterStore = 'all';
        let changeViewMode = 'list'; // 'list' or 'grid'
        let changeCurrentWeekStart = getChangeWeekStart(new Date()); // Current week start date

        // Helper function to get week start (Monday)
        function getChangeWeekStart(date) {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
            d.setDate(diff);
            d.setHours(0, 0, 0, 0);
            return d;
        }

        // Helper function to get week end (Sunday)
        function getChangeWeekEnd(weekStart) {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + 6);
            d.setHours(23, 59, 59, 999);
            return d;
        }

        // Format week range for display
        function formatChangeWeekRange(weekStart) {
            const weekEnd = getChangeWeekEnd(weekStart);
            const options = { month: 'short', day: 'numeric' };
            return `${weekStart.toLocaleDateString('en-US', options)} - ${weekEnd.toLocaleDateString('en-US', options)}, ${weekStart.getFullYear()}`;
        }

        // Navigate weeks
        window.changeWeekPrev = function() {
            const newDate = new Date(changeCurrentWeekStart);
            newDate.setDate(newDate.getDate() - 7);
            changeCurrentWeekStart = newDate;
            renderChange();
        };

        window.changeWeekNext = function() {
            const newDate = new Date(changeCurrentWeekStart);
            newDate.setDate(newDate.getDate() + 7);
            changeCurrentWeekStart = newDate;
            renderChange();
        };

        window.changeWeekToday = function() {
            changeCurrentWeekStart = getChangeWeekStart(new Date());
            renderChange();
        };

        function renderChange() {
            const dashboard = document.querySelector('.dashboard');
            const today = new Date().toISOString().split('T')[0];

            // Week boundaries
            const weekStart = changeCurrentWeekStart;
            const weekEnd = getChangeWeekEnd(weekStart);
            const weekStartStr = weekStart.toISOString().split('T')[0];
            const weekEndStr = weekEnd.toISOString().split('T')[0];

            // Filter records by store first
            let filteredRecords = changeFilterStore === 'all'
                ? changeRecords
                : changeRecords.filter(r => r.store === changeFilterStore);

            // Then filter by week
            filteredRecords = filteredRecords.filter(r => {
                const recordDate = r.date;
                return recordDate >= weekStartStr && recordDate <= weekEndStr;
            });

            // Sort by date descending
            const sortedRecords = [...filteredRecords].sort((a, b) => new Date(b.date) - new Date(a.date));

            // Week's total
            const weekTotal = filteredRecords.reduce((sum, r) => sum + (r.amount || 0), 0);

            // Check if current week contains today
            const isCurrentWeek = today >= weekStartStr && today <= weekEndStr;

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title" style="display: flex; align-items: center; gap: 12px;">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-coins" style="color: white; font-size: 20px;"></i>
                            </div>
                            Daily Change Register
                        </h2>
                        <p class="section-subtitle">Record daily change by denomination</p>
                    </div>
                    <button class="btn-primary" onclick="openDailyChangeForm()">
                        <i class="fas fa-plus"></i> New Daily Record
                    </button>
                </div>

                <!-- Week Navigation -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; background: var(--bg-secondary); border-radius: 12px; padding: 16px; border: 1px solid var(--border-color);">
                    <button onclick="changeWeekPrev()" style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 16px; cursor: pointer; color: var(--text-primary); display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
                        <i class="fas fa-chevron-left"></i> Prev Week
                    </button>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: 600; color: var(--text-primary);">${formatChangeWeekRange(weekStart)}</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${isCurrentWeek ? 'Current Week' : ''}</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${!isCurrentWeek ? `
                            <button onclick="changeWeekToday()" style="background: var(--accent-primary); border: none; border-radius: 8px; padding: 10px 16px; cursor: pointer; color: white; font-weight: 500; transition: all 0.2s;">
                                <i class="fas fa-calendar-day"></i> Today
                            </button>
                        ` : ''}
                        <button onclick="changeWeekNext()" style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 16px; cursor: pointer; color: var(--text-primary); display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
                            Next Week <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <!-- Quick Stats -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 16px; padding: 20px; color: white;">
                        <div style="font-size: 13px; opacity: 0.9; margin-bottom: 8px;">Week Total</div>
                        <div style="font-size: 28px; font-weight: 700;">$${weekTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${filteredRecords.length} record${filteredRecords.length !== 1 ? 's' : ''} this week</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 16px; padding: 20px; color: white;">
                        <div style="font-size: 13px; opacity: 0.9; margin-bottom: 8px;">Total Records</div>
                        <div style="font-size: 28px; font-weight: 700;">${changeRecords.length}</div>
                        <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">All time</div>
                    </div>
                </div>

                <!-- Daily Change Form (hidden by default) -->
                <div id="daily-change-form" style="display: none; margin-bottom: 24px;"></div>

                <!-- Filter -->
                <div style="display: flex; gap: 12px; margin-bottom: 20px; align-items: center;">
                    <select class="form-input" style="width: 200px;" onchange="filterChangeByStore(this.value)">
                        <option value="all" ${changeFilterStore === 'all' ? 'selected' : ''}>All Stores</option>
                        <option value="Miramar" ${changeFilterStore === 'Miramar' ? 'selected' : ''}>VSU Miramar</option>
                        <option value="Morena" ${changeFilterStore === 'Morena' ? 'selected' : ''}>VSU Morena</option>
                        <option value="Kearny Mesa" ${changeFilterStore === 'Kearny Mesa' ? 'selected' : ''}>VSU Kearny Mesa</option>
                        <option value="Chula Vista" ${changeFilterStore === 'Chula Vista' ? 'selected' : ''}>VSU Chula Vista</option>
                        <option value="Miramar Wine & Liquor" ${changeFilterStore === 'Miramar Wine & Liquor' ? 'selected' : ''}>Miramar Wine & Liquor</option>
                    </select>
                    <span style="font-size: 13px; color: var(--text-muted);">${filteredRecords.length} records this week</span>
                    <!-- View Toggle -->
                    <div style="display: flex; background: var(--bg-secondary); border-radius: 8px; padding: 3px; border: 1px solid var(--border-color); margin-left: auto;">
                        <button onclick="setChangeViewMode('list')" id="change-view-list-btn" style="width: 34px; height: 34px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${changeViewMode === 'list' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="List View">
                            <i class="fas fa-list"></i>
                        </button>
                        <button onclick="setChangeViewMode('grid')" id="change-view-grid-btn" style="width: 34px; height: 34px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${changeViewMode === 'grid' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="Grid View">
                            <i class="fas fa-th-large"></i>
                        </button>
                    </div>
                </div>

                <!-- Records List/Grid -->
                <div id="change-records-container">
                    ${sortedRecords.length === 0 ? `
                        <div class="card">
                            <div class="card-body" style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
                                <i class="fas fa-coins" style="font-size: 48px; margin-bottom: 16px; display: block; opacity: 0.3;"></i>
                                <div style="font-size: 16px; margin-bottom: 8px;">No change records for this week</div>
                                <div style="font-size: 13px;">Click "New Daily Record" to add one or navigate to another week</div>
                            </div>
                        </div>
                    ` : changeViewMode === 'grid' ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                            ${sortedRecords.map(record => renderChangeRecordCard(record)).join('')}
                        </div>
                    ` : `
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${sortedRecords.map(record => renderChangeRecordRow(record)).join('')}
                        </div>
                    `}
                </div>
            `;
        }

        function renderDailyChangeForm() {
            const today = new Date().toISOString().split('T')[0];
            return `
                <div class="card" style="border: 2px solid #f59e0b; background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, var(--bg-secondary) 100%);">
                    <div class="card-header" style="background: transparent;">
                        <h3 class="card-title" style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-coins" style="color: #f59e0b;"></i>
                            New Daily Change Record
                        </h3>
                        <button onclick="closeDailyChangeForm()" style="background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 8px;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="card-body" style="padding: 24px;">
                        <!-- Basic Info -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px;">
                            <div>
                                <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Date</label>
                                <input type="date" id="change-date" class="form-input" value="${today}">
                            </div>
                            <div>
                                <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Store</label>
                                <select id="change-store" class="form-input">
                                    <option value="Miramar">VSU Miramar</option>
                                    <option value="Morena">VSU Morena</option>
                                    <option value="Kearny Mesa">VSU Kearny Mesa</option>
                                    <option value="Chula Vista">VSU Chula Vista</option>
                                    <option value="North Park">VSU North Park</option>
                                    <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Recorded By</label>
                                <input type="text" id="change-recorded-by" class="form-input" placeholder="Your name">
                            </div>
                        </div>

                        <!-- Coins Section -->
                        <div style="margin-bottom: 24px;">
                            <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-circle" style="color: #f59e0b; font-size: 10px;"></i> Coins
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                                ${CHANGE_DENOMINATIONS.coins.map(d => `
                                    <div style="background: var(--bg-primary); border-radius: 12px; padding: 14px; text-align: center;">
                                        <div style="font-size: 18px; font-weight: 700; color: #f59e0b; margin-bottom: 6px;">${d.icon}</div>
                                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">${d.label}</div>
                                        <input type="number" id="change-${d.id}" class="form-input" placeholder="0" min="0"
                                            style="text-align: center; font-weight: 600;" oninput="calculateDailyChangeTotal()">
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Bills Section -->
                        <div style="margin-bottom: 24px;">
                            <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-money-bill" style="color: #10b981; font-size: 10px;"></i> Bills
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                                ${CHANGE_DENOMINATIONS.bills.map(d => `
                                    <div style="background: var(--bg-primary); border-radius: 12px; padding: 14px; text-align: center;">
                                        <div style="font-size: 18px; font-weight: 700; color: #10b981; margin-bottom: 6px;">${d.icon}</div>
                                        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">${d.label}</div>
                                        <input type="number" id="change-${d.id}" class="form-input" placeholder="0" min="0"
                                            style="text-align: center; font-weight: 600;" oninput="calculateDailyChangeTotal()">
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Total -->
                        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                            <div style="font-size: 13px; color: rgba(255,255,255,0.9); margin-bottom: 6px;">TOTAL</div>
                            <div id="change-total-display" style="font-size: 32px; font-weight: 700; color: white;">$0.00</div>
                        </div>

                        <!-- Photo Upload with AI Scan -->
                        <div style="margin-bottom: 20px;">
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Photo of Money</label>
                            <div style="display: flex; gap: 12px; align-items: flex-start;">
                                <div style="flex: 1;">
                                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;">
                                        <label style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: 2px dashed var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#f59e0b'" onmouseout="this.style.borderColor='var(--border-color)'">
                                            <i class="fas fa-camera" style="color: var(--text-muted);"></i>
                                            <span style="font-size: 13px; color: var(--text-muted);">Upload Photo</span>
                                            <input type="file" id="change-photo" accept="image/*" style="display: none;" onchange="previewChangePhoto(this)">
                                        </label>
                                        <button type="button" id="daily-change-ai-scan-btn" onclick="scanDailyChangeWithAI()" style="padding: 10px 16px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border: none; color: white; border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(139,92,246,0.4)';" onmouseout="this.style.transform='none'; this.style.boxShadow='none';">
                                            <i class="fas fa-magic"></i> Scan with AI
                                        </button>
                                    </div>
                                    <p style="font-size: 11px; color: var(--text-muted); margin: 0;">Upload a photo of the money, then click "Scan with AI" to auto-count</p>
                                </div>
                                <div id="change-photo-preview" style="display: none; position: relative; width: 80px; height: 80px; border-radius: 10px; overflow: hidden; background: var(--bg-secondary); border: 2px solid var(--border-color);">
                                    <img id="change-photo-img" src="" style="width: 100%; height: 100%; object-fit: cover;">
                                    <button onclick="removeChangePhoto()" style="position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%; background: rgba(239, 68, 68, 0.9); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; transition: all 0.2s;" onmouseover="this.style.background='#ef4444'" onmouseout="this.style.background='rgba(239, 68, 68, 0.9)'">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Notes -->
                        <div style="margin-bottom: 20px;">
                            <label style="font-size: 12px; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px;">Notes (optional)</label>
                            <textarea id="change-notes" class="form-input" placeholder="Any additional notes..." style="min-height: 60px; resize: vertical;"></textarea>
                        </div>

                        <!-- Actions -->
                        <div style="display: flex; justify-content: flex-end; gap: 12px;">
                            <button class="btn-secondary" onclick="closeDailyChangeForm()">Cancel</button>
                            <button class="btn-primary" onclick="saveDailyChange()">
                                <i class="fas fa-save"></i> Save Record
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function renderChangeRecordRow(record) {
            const recordId = record.firestoreId || record.id;
            const recordDate = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const isToday = record.date === new Date().toISOString().split('T')[0];

            return `
                <div class="card" style="border-radius: 12px; overflow: hidden; ${isToday ? 'border-left: 4px solid #f59e0b;' : ''}">
                    <div onclick="toggleChangeDetails('${recordId}')" style="display: flex; align-items: center; padding: 16px 20px; gap: 16px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background='transparent'">
                        <!-- Date -->
                        <div style="min-width: 80px;">
                            <div style="font-weight: 600; font-size: 14px; color: var(--text-primary);">${recordDate}</div>
                            ${isToday ? '<div style="font-size: 10px; color: #f59e0b; font-weight: 600;">TODAY</div>' : ''}
                        </div>

                        <!-- Store -->
                        <div style="background: var(--accent-primary); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                            ${record.store}
                        </div>

                        <!-- Amount -->
                        <div style="flex: 1; text-align: right;">
                            <div style="font-size: 20px; font-weight: 700; color: #10b981;">$${(record.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                        </div>

                        <!-- Recorded By -->
                        <div style="font-size: 13px; color: var(--text-muted); min-width: 100px; display: flex; align-items: center; gap: 8px;">
                            <span><i class="fas fa-user" style="margin-right: 6px;"></i>${record.recordedBy || record.leftBy || 'Unknown'}</span>
                            ${record.photo ? '<i class="fas fa-image" style="color: #f59e0b;" title="Has photo"></i>' : ''}
                        </div>

                        <!-- Arrow -->
                        <div style="color: var(--text-muted);" id="change-arrow-${recordId}">
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>

                    <!-- Expanded Details -->
                    <div id="change-details-${recordId}" style="display: none; padding: 0 20px 20px; border-top: 1px solid var(--border-color);">
                        <div style="padding-top: 16px;">
                            <!-- Denomination Breakdown -->
                            ${record.denominations && Object.keys(record.denominations).length > 0 ? `
                                <div style="margin-bottom: 16px;">
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                        <!-- Bills (left side, highest to lowest) -->
                                        <div>
                                            <div style="font-size: 12px; font-weight: 600; color: #10b981; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                                                <i class="fas fa-money-bill"></i> Bills
                                            </div>
                                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                                ${[...CHANGE_DENOMINATIONS.bills].reverse().map(d => {
                                                    const count = record.denominations[d.id] || 0;
                                                    if (count === 0) return '';
                                                    const total = count * d.value;
                                                    return `
                                                        <div style="background: rgba(16, 185, 129, 0.1); border-radius: 10px; padding: 12px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(16, 185, 129, 0.2);">
                                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                                <div style="font-size: 18px; font-weight: 700; color: #10b981;">${d.icon}</div>
                                                                <div style="font-size: 12px; color: var(--text-muted);">x${count}</div>
                                                            </div>
                                                            <div style="font-size: 14px; color: var(--text-primary); font-weight: 600;">$${total.toFixed(2)}</div>
                                                        </div>
                                                    `;
                                                }).join('')}
                                            </div>
                                        </div>
                                        <!-- Coins (right side, highest to lowest) -->
                                        <div>
                                            <div style="font-size: 12px; font-weight: 600; color: #f59e0b; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                                                <i class="fas fa-coins"></i> Coins
                                            </div>
                                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                                ${[...CHANGE_DENOMINATIONS.coins].reverse().map(d => {
                                                    const count = record.denominations[d.id] || 0;
                                                    if (count === 0) return '';
                                                    const total = count * d.value;
                                                    return `
                                                        <div style="background: rgba(245, 158, 11, 0.1); border-radius: 10px; padding: 12px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(245, 158, 11, 0.2);">
                                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                                <div style="font-size: 18px; font-weight: 700; color: #f59e0b;">${d.icon}</div>
                                                                <div style="font-size: 12px; color: var(--text-muted);">x${count}</div>
                                                            </div>
                                                            <div style="font-size: 14px; color: var(--text-primary); font-weight: 600;">$${total.toFixed(2)}</div>
                                                        </div>
                                                    `;
                                                }).join('')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <div style="background: var(--bg-secondary); border-radius: 10px; padding: 16px; margin-bottom: 16px; text-align: center;">
                                    <div style="font-size: 24px; font-weight: 700; color: #10b981;">$${(record.amount || 0).toFixed(2)}</div>
                                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Total Amount</div>
                                </div>
                            `}

                            ${record.photo ? `
                                <div style="margin-bottom: 16px;">
                                    <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">
                                        <i class="fas fa-image"></i> Envelope Photo
                                    </div>
                                    <div style="border-radius: 10px; overflow: hidden; background: var(--bg-secondary);">
                                        <img src="${record.photo}" alt="Envelope" style="width: 100%; max-height: 200px; object-fit: contain; cursor: pointer;" onclick="window.open('${record.photo}', '_blank')">
                                    </div>
                                </div>
                            ` : ''}

                            ${record.notes ? `
                                <div style="background: var(--bg-secondary); border-radius: 10px; padding: 12px; margin-bottom: 16px;">
                                    <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 4px;">Notes</div>
                                    <div style="font-size: 13px; color: var(--text-secondary);">${record.notes}</div>
                                </div>
                            ` : ''}

                            <div style="display: flex; justify-content: flex-end; gap: 8px;">
                                <button onclick="event.stopPropagation(); deleteChangeRecord('${recordId}')" class="btn-secondary" style="font-size: 12px; color: #ef4444; border-color: #ef444450;">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Render change record as grid card
        function renderChangeRecordCard(record) {
            const recordId = record.firestoreId || record.id;
            const recordDate = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const isToday = record.date === new Date().toISOString().split('T')[0];

            // Count denominations
            let billsCount = 0;
            let coinsCount = 0;
            if (record.denominations) {
                CHANGE_DENOMINATIONS.bills.forEach(d => { billsCount += record.denominations[d.id] || 0; });
                CHANGE_DENOMINATIONS.coins.forEach(d => { coinsCount += record.denominations[d.id] || 0; });
            }

            return `
                <div class="change-grid-card" style="background: var(--bg-secondary); border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); transition: all 0.2s; ${isToday ? 'border-top: 4px solid #f59e0b;' : ''}" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; color: white;">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${recordDate} ${isToday ? '• TODAY' : ''}</div>
                                <div style="font-size: 28px; font-weight: 700;">$${(record.amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                            </div>
                            <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-coins" style="font-size: 20px;"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Body -->
                    <div style="padding: 16px 20px;">
                        <!-- Store Badge -->
                        <div style="margin-bottom: 12px;">
                            <span style="background: var(--accent-primary); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                                ${record.store}
                            </span>
                        </div>

                        <!-- Denominations Summary -->
                        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                            <div style="flex: 1; background: rgba(16, 185, 129, 0.1); border-radius: 10px; padding: 12px; text-align: center;">
                                <div style="font-size: 20px; font-weight: 700; color: #10b981;">${billsCount}</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Bills</div>
                            </div>
                            <div style="flex: 1; background: rgba(245, 158, 11, 0.1); border-radius: 10px; padding: 12px; text-align: center;">
                                <div style="font-size: 20px; font-weight: 700; color: #f59e0b;">${coinsCount}</div>
                                <div style="font-size: 11px; color: var(--text-muted);">Coins</div>
                            </div>
                        </div>

                        <!-- Recorded By -->
                        <div style="font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-user"></i>
                            <span>${record.recordedBy || record.leftBy || 'Unknown'}</span>
                            ${record.photo ? '<i class="fas fa-image" style="color: #f59e0b; margin-left: auto;" title="Has photo"></i>' : ''}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="padding: 12px 20px; border-top: 1px solid var(--border-color); display: flex; gap: 8px; justify-content: flex-end;">
                        <button onclick="viewChangeRecord('${recordId}')" class="btn-icon" title="View Details" style="width: 32px; height: 32px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="deleteChangeRecord('${recordId}')" class="btn-icon" title="Delete" style="width: 32px; height: 32px; color: var(--danger);">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        // Set Change Records view mode (list or grid)
        function setChangeViewMode(mode) {
            changeViewMode = mode;

            // Update button styles
            const listBtn = document.getElementById('change-view-list-btn');
            const gridBtn = document.getElementById('change-view-grid-btn');

            if (listBtn && gridBtn) {
                if (mode === 'list') {
                    listBtn.style.background = 'var(--accent-primary)';
                    listBtn.style.color = 'white';
                    gridBtn.style.background = 'transparent';
                    gridBtn.style.color = 'var(--text-muted)';
                } else {
                    gridBtn.style.background = 'var(--accent-primary)';
                    gridBtn.style.color = 'white';
                    listBtn.style.background = 'transparent';
                    listBtn.style.color = 'var(--text-muted)';
                }
            }

            // Re-render the page
            renderChange();
        }

        function openDailyChangeForm() {
            const form = document.getElementById('daily-change-form');
            form.style.display = 'block';
            form.innerHTML = renderDailyChangeForm();
            form.scrollIntoView({ behavior: 'smooth' });
        }

        function closeDailyChangeForm() {
            document.getElementById('daily-change-form').style.display = 'none';
            // Reset photo preview
            removeChangePhoto();
        }

        // AI scan for Daily Change Form - analyze money in photo
        async function scanDailyChangeWithAI() {
            const photoInput = document.getElementById('change-photo');

            if (!photoInput || !photoInput.files || !photoInput.files[0]) {
                alert('Please upload a photo of the money first.');
                return;
            }

            const file = photoInput.files[0];
            if (file.type === 'application/pdf') {
                alert('Please upload an image file (JPG, PNG), not a PDF.');
                return;
            }

            // Show loading state
            const scanBtn = document.getElementById('daily-change-ai-scan-btn');
            const originalText = scanBtn ? scanBtn.innerHTML : '';
            if (scanBtn) {
                scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
                scanBtn.disabled = true;
            }

            try {
                // Convert image to base64
                const base64Image = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const apiKey = getOpenAIKey();

                // Call OpenAI API
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + apiKey
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o',
                        max_tokens: 1024,
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    {
                                        type: 'image_url',
                                        image_url: { url: base64Image }
                                    },
                                    {
                                        type: 'text',
                                        text: `Analyze this image of money/cash and count the bills and coins visible. Return ONLY a JSON object with the count of each denomination (use 0 if not visible):

{
    "hundreds": 0,
    "fifties": 0,
    "twenties": 0,
    "tens": 0,
    "fives": 0,
    "ones": 0,
    "dollars_coin": 0,
    "quarters": 0,
    "dimes": 0,
    "nickels": 0,
    "pennies": 0,
    "notes": "any relevant observations about the money"
}

Count each bill/coin you can see clearly. If bills are stacked, try to estimate the count. Return ONLY the JSON object.`
                                    }
                                ]
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'API request failed');
                }

                const data = await response.json();
                const content = data.choices[0].message.content;

                // Parse the JSON response
                let moneyData;
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        moneyData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found in response');
                    }
                } catch (parseError) {
                    console.error('Error parsing AI response:', content);
                    throw new Error('Could not parse money data from AI response');
                }

                // Fill in the denomination fields
                const fieldMappings = ['hundreds', 'fifties', 'twenties', 'tens', 'fives', 'ones', 'dollars_coin', 'quarters', 'dimes', 'nickels', 'pennies'];
                fieldMappings.forEach(field => {
                    if (moneyData[field]) {
                        const input = document.getElementById(`change-${field}`);
                        if (input) input.value = moneyData[field];
                    }
                });

                // Add notes if any
                if (moneyData.notes) {
                    const notesField = document.getElementById('change-notes');
                    if (notesField) {
                        notesField.value = moneyData.notes;
                    }
                }

                // Recalculate total
                calculateDailyChangeTotal();

                alert('Money counted successfully! Please review the values.');

            } catch (error) {
                console.error('Error scanning money with AI:', error);
                alert('Error scanning: ' + error.message);
            } finally {
                if (scanBtn) {
                    scanBtn.innerHTML = originalText || '<i class="fas fa-magic"></i> Scan with AI';
                    scanBtn.disabled = false;
                }
            }
        }

        // Calculate total for daily change form in real-time
        function calculateDailyChangeTotal() {
            let total = 0;
            [...CHANGE_DENOMINATIONS.coins, ...CHANGE_DENOMINATIONS.bills].forEach(d => {
                const count = parseInt(document.getElementById(`change-${d.id}`)?.value) || 0;
                total += count * d.value;
            });

            const displayEl = document.getElementById('change-total-display');
            if (displayEl) {
                displayEl.textContent = `$${total.toFixed(2)}`;
            }
            return total;
        }

        async function saveDailyChange() {
            const date = document.getElementById('change-date').value;
            const store = document.getElementById('change-store').value;
            const recordedBy = document.getElementById('change-recorded-by').value.trim();
            const notes = document.getElementById('change-notes').value.trim();
            const photoInput = document.getElementById('change-photo');

            if (!recordedBy) {
                alert('Please enter your name');
                return;
            }

            const denominations = {};
            let total = 0;
            [...CHANGE_DENOMINATIONS.coins, ...CHANGE_DENOMINATIONS.bills].forEach(d => {
                const count = parseInt(document.getElementById(`change-${d.id}`)?.value) || 0;
                if (count > 0) {
                    denominations[d.id] = count;
                    total += count * d.value;
                }
            });

            if (total === 0) {
                alert('Please enter at least one denomination');
                return;
            }

            // Upload photo to Firebase Storage if provided
            let photoUrl = null;
            let photoPath = null;
            if (photoInput && photoInput.files && photoInput.files[0]) {
                const rawBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(photoInput.files[0]);
                });

                // Initialize storage helper if needed
                if (!firebaseStorageHelper.isInitialized) {
                    firebaseStorageHelper.initialize();
                }

                try {
                    const tempId = Date.now().toString();
                    const uploadResult = await firebaseStorageHelper.uploadImage(
                        rawBase64,
                        'change-records/photos',
                        tempId
                    );
                    photoUrl = uploadResult.url;
                    photoPath = uploadResult.path;
                } catch (err) {
                    console.error('Error uploading change record photo to Storage:', err);
                    // Fallback to compressed base64
                    try {
                        photoUrl = await compressImage(rawBase64);
                    } catch (compressErr) {
                        console.error('Error compressing image:', compressErr);
                        photoUrl = rawBase64;
                    }
                }
            }

            const newRecord = {
                date,
                store,
                recordedBy,
                leftBy: recordedBy,
                receivedBy: recordedBy,
                amount: total,
                denominations,
                notes,
                photo: photoUrl,
                photoPath: photoPath,
                createdAt: new Date().toISOString()
            };

            try {
                // Save to Firebase
                if (typeof firebaseChangeRecordsManager !== 'undefined' && firebaseChangeRecordsManager.isInitialized) {
                    const docId = await firebaseChangeRecordsManager.addChangeRecord(newRecord);
                    if (docId) {
                        newRecord.id = docId;
                        newRecord.firestoreId = docId;
                        changeRecords.unshift(newRecord);
                        closeDailyChangeForm();
                        renderChange();
                    } else {
                        alert('Error saving record to Firebase');
                    }
                } else {
                    // Fallback to local storage
                    newRecord.id = Date.now().toString();
                    changeRecords.unshift(newRecord);
                    localStorage.setItem('changeRecords', JSON.stringify(changeRecords));
                    closeDailyChangeForm();
                    renderChange();
                }
            } catch (error) {
                console.error('Error saving change record:', error);
                alert('Error saving record. Please try again.');
            }
        }

        function toggleChangeDetails(id) {
            const details = document.getElementById(`change-details-${id}`);
            const arrow = document.getElementById(`change-arrow-${id}`);

            if (details.style.display === 'none') {
                // Collapse all others
                document.querySelectorAll('[id^="change-details-"]').forEach(el => el.style.display = 'none');
                document.querySelectorAll('[id^="change-arrow-"]').forEach(el => el.style.transform = 'rotate(0deg)');

                details.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
            } else {
                details.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            }
        }

        function filterChangeByStore(store) {
            changeFilterStore = store;
            renderChange();
        }

        function filterChangeRecords(store) {
            filterChangeByStore(store);
        }

        function viewChangeRecord(id) {
            const record = changeRecords.find(r => r.id === id || r.firestoreId === id);
            if (!record) return;

            const recordId = record.firestoreId || record.id;
            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            const photoDisplay = record.photo
                ? `<img src="${record.photo}" style="width: 100%; max-height: 300px; object-fit: contain; border-radius: 8px;" alt="Change photo">`
                : `<div style="text-align: center; padding: 40px; background: var(--bg-secondary); border-radius: 8px; color: var(--text-muted);">
                    <i class="fas fa-image" style="font-size: 48px; margin-bottom: 12px; display: block;"></i>
                    No photo available
                </div>`;

            // Build denominations display if available
            let denominationsDisplay = '';
            if (record.denominations) {
                const d = record.denominations;
                const billsItems = [];
                const coinsItems = [];

                // Bills
                if (d.bills?.hundreds > 0) billsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>$100</strong> × ${d.bills.hundreds}</span>`);
                if (d.bills?.fifties > 0) billsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>$50</strong> × ${d.bills.fifties}</span>`);
                if (d.bills?.twenties > 0) billsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>$20</strong> × ${d.bills.twenties}</span>`);
                if (d.bills?.tens > 0) billsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>$10</strong> × ${d.bills.tens}</span>`);
                if (d.bills?.fives > 0) billsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>$5</strong> × ${d.bills.fives}</span>`);
                if (d.bills?.twos > 0) billsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>$2</strong> × ${d.bills.twos}</span>`);
                if (d.bills?.ones > 0) billsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>$1</strong> × ${d.bills.ones}</span>`);

                // Coins
                if (d.coins?.dollars > 0) coinsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>$1</strong> × ${d.coins.dollars}</span>`);
                if (d.coins?.halfDollars > 0) coinsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>50¢</strong> × ${d.coins.halfDollars}</span>`);
                if (d.coins?.quarters > 0) coinsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>25¢</strong> × ${d.coins.quarters}</span>`);
                if (d.coins?.dimes > 0) coinsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>10¢</strong> × ${d.coins.dimes}</span>`);
                if (d.coins?.nickels > 0) coinsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>5¢</strong> × ${d.coins.nickels}</span>`);
                if (d.coins?.pennies > 0) coinsItems.push(`<span style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: var(--bg-tertiary); border-radius: 6px; font-size: 12px;"><strong>1¢</strong> × ${d.coins.pennies}</span>`);

                if (billsItems.length > 0 || coinsItems.length > 0) {
                    denominationsDisplay = `
                        <div style="margin-top: 20px; padding: 16px; background: var(--bg-secondary); border-radius: 12px;">
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                <i class="fas fa-money-bill-wave" style="color: var(--success);"></i> Currency Breakdown
                            </label>
                            ${billsItems.length > 0 ? `
                                <div style="margin-bottom: 12px;">
                                    <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">Bills</div>
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">${billsItems.join('')}</div>
                                </div>
                            ` : ''}
                            ${coinsItems.length > 0 ? `
                                <div>
                                    <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">Coins</div>
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">${coinsItems.join('')}</div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }
            }

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-coins"></i> Change Record Details</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 20px;">
                        ${photoDisplay}
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div>
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Store</label>
                            <p style="margin: 0; font-weight: 500;">VSU ${record.store}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Total Amount</label>
                            <p style="margin: 0; font-weight: 600; color: var(--success); font-size: 20px;">$${record.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Date</label>
                            <p style="margin: 0; font-weight: 500;">${formatDate(record.date)}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Left By</label>
                            <p style="margin: 0; font-weight: 500;">${record.leftBy}</p>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Received By</label>
                            <p style="margin: 0; font-weight: 500;">${record.receivedBy}</p>
                        </div>
                    </div>

                    ${denominationsDisplay}

                    ${record.changeInStore !== undefined && record.changeInStore !== null ? `
                        <div style="margin-top: 20px; padding: 16px; background: linear-gradient(135deg, #10b98115, #10b98108); border: 2px solid #10b98140; border-radius: 12px;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="width: 40px; height: 40px; background: #10b98120; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-cash-register" style="color: #10b981; font-size: 18px;"></i>
                                </div>
                                <div>
                                    <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 4px;">Change in Store</label>
                                    <p style="margin: 0; font-weight: 700; font-size: 24px; color: #10b981;">$${record.changeInStore.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    ${record.notes ? `
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                            <label style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px;">Notes</label>
                            <p style="margin: 0; line-height: 1.6; color: var(--text-secondary);">${record.notes}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                    <button class="btn-primary" style="background: var(--danger); border-color: var(--danger);" onclick="closeModal(); deleteChangeRecord('${recordId}');">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;

            modal.classList.add('active');
        }

        function viewChangePhoto(id) {
            const record = changeRecords.find(r => r.id === id || r.firestoreId === id);
            if (!record || !record.photo) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2><i class="fas fa-image"></i> Change Photo</h2>
                    <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body" style="padding: 0;">
                    <img src="${record.photo}" style="width: 100%; height: auto; display: block;" alt="Change photo">
                </div>
            `;

            modal.classList.add('active');
        }

        async function deleteChangeRecord(id) {
            showConfirmModal({
                title: 'Delete Change Record',
                message: 'Are you sure you want to delete this change record? This action cannot be undone.',
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    try {
                        // Delete from Firebase
                        if (typeof firebaseChangeRecordsManager !== 'undefined' && firebaseChangeRecordsManager.isInitialized) {
                            const success = await firebaseChangeRecordsManager.deleteChangeRecord(id);
                            if (success) {
                                changeRecords = changeRecords.filter(r => r.id !== id && r.firestoreId !== id);
                                renderChange();
                            } else {
                                showNotification('Error deleting record from Firebase', 'error');
                            }
                        } else {
                            // Fallback to local deletion
                            changeRecords = changeRecords.filter(r => r.id !== id && r.firestoreId !== id);
                            renderChange();
                        }
                    } catch (error) {
                        console.error('Error deleting change record:', error);
                        showNotification('Error deleting record. Please try again.', 'error');
                    }
                }
            });
        }

        // Helper function to preview change photo
        function previewChangePhoto(input) {
            const preview = document.getElementById('change-photo-preview');
            const previewImg = document.getElementById('change-photo-img');
            if (!preview || !previewImg) return;

            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImg.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(input.files[0]);
            }
        }

        // Helper function to remove change photo
        function removeChangePhoto() {
            const preview = document.getElementById('change-photo-preview');
            const previewImg = document.getElementById('change-photo-img');
            const input = document.getElementById('change-photo');

            if (preview) {
                preview.style.display = 'none';
            }
            if (previewImg) {
                previewImg.src = '';
            }
            if (input) {
                input.value = '';
            }
        }

        // Calculate total from currency breakdown
        function calculateChangeTotal() {
            let total = 0;

            // Bills
            const bills100 = parseInt(document.getElementById('change-bills-100')?.value) || 0;
            const bills50 = parseInt(document.getElementById('change-bills-50')?.value) || 0;
            const bills20 = parseInt(document.getElementById('change-bills-20')?.value) || 0;
            const bills10 = parseInt(document.getElementById('change-bills-10')?.value) || 0;
            const bills5 = parseInt(document.getElementById('change-bills-5')?.value) || 0;
            const bills2 = parseInt(document.getElementById('change-bills-2')?.value) || 0;
            const bills1 = parseInt(document.getElementById('change-bills-1')?.value) || 0;

            // Coins
            const coins100 = parseInt(document.getElementById('change-coins-100')?.value) || 0;
            const coins50 = parseInt(document.getElementById('change-coins-50')?.value) || 0;
            const coins25 = parseInt(document.getElementById('change-coins-25')?.value) || 0;
            const coins10 = parseInt(document.getElementById('change-coins-10')?.value) || 0;
            const coins5 = parseInt(document.getElementById('change-coins-5')?.value) || 0;
            const coins1 = parseInt(document.getElementById('change-coins-1')?.value) || 0;

            total = (bills100 * 100) + (bills50 * 50) + (bills20 * 20) + (bills10 * 10) +
                    (bills5 * 5) + (bills2 * 2) + (bills1 * 1) +
                    (coins100 * 1) + (coins50 * 0.50) + (coins25 * 0.25) +
                    (coins10 * 0.10) + (coins5 * 0.05) + (coins1 * 0.01);

            // Update display
            const displayEl = document.getElementById('change-total-display');
            if (displayEl) {
                displayEl.textContent = total.toFixed(2);
            }

            return total;
        }

        // Get currency breakdown object
        function getChangeDenominations() {
            return {
                bills: {
                    hundreds: parseInt(document.getElementById('change-bills-100')?.value) || 0,
                    fifties: parseInt(document.getElementById('change-bills-50')?.value) || 0,
                    twenties: parseInt(document.getElementById('change-bills-20')?.value) || 0,
                    tens: parseInt(document.getElementById('change-bills-10')?.value) || 0,
                    fives: parseInt(document.getElementById('change-bills-5')?.value) || 0,
                    twos: parseInt(document.getElementById('change-bills-2')?.value) || 0,
                    ones: parseInt(document.getElementById('change-bills-1')?.value) || 0
                },
                coins: {
                    dollars: parseInt(document.getElementById('change-coins-100')?.value) || 0,
                    halfDollars: parseInt(document.getElementById('change-coins-50')?.value) || 0,
                    quarters: parseInt(document.getElementById('change-coins-25')?.value) || 0,
                    dimes: parseInt(document.getElementById('change-coins-10')?.value) || 0,
                    nickels: parseInt(document.getElementById('change-coins-5')?.value) || 0,
                    pennies: parseInt(document.getElementById('change-coins-1')?.value) || 0
                }
            };
        }

        async function saveChangeRecord() {
            const store = document.getElementById('change-store').value;
            const date = document.getElementById('change-date').value;
            const leftBy = document.getElementById('change-left-by').value.trim();
            const receivedBy = document.getElementById('change-received-by').value.trim();
            const notes = document.getElementById('change-notes').value.trim();
            const changeInStore = parseFloat(document.getElementById('change-in-store')?.value) || 0;
            const photoInput = document.getElementById('change-photo');

            // Calculate amount from denominations
            const amount = calculateChangeTotal();
            const denominations = getChangeDenominations();

            if (!store || !date || !leftBy || !receivedBy) {
                alert('Please fill in all required fields');
                return;
            }

            if (amount <= 0) {
                alert('Please enter at least one denomination');
                return;
            }

            // Upload photo to Firebase Storage if provided
            let photoUrl = null;
            let photoPath = null;
            if (photoInput && photoInput.files && photoInput.files[0]) {
                const rawBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(photoInput.files[0]);
                });

                // Initialize storage helper if needed
                if (!firebaseStorageHelper.isInitialized) {
                    firebaseStorageHelper.initialize();
                }

                try {
                    const tempId = Date.now().toString();
                    const uploadResult = await firebaseStorageHelper.uploadImage(
                        rawBase64,
                        'change-records/photos',
                        tempId
                    );
                    photoUrl = uploadResult.url;
                    photoPath = uploadResult.path;
                } catch (err) {
                    console.error('Error uploading change record photo to Storage:', err);
                    // Fallback to compressed base64
                    try {
                        photoUrl = await compressImage(rawBase64);
                    } catch (compressErr) {
                        console.error('Error compressing image:', compressErr);
                        photoUrl = rawBase64;
                    }
                }
            }

            const newRecord = {
                store,
                amount,
                date,
                leftBy,
                receivedBy,
                notes,
                changeInStore,
                denominations,
                photo: photoUrl,      // Now stores URL instead of base64
                photoPath: photoPath  // For future deletion
            };

            try {
                // Save to Firebase
                if (typeof firebaseChangeRecordsManager !== 'undefined' && firebaseChangeRecordsManager.isInitialized) {
                    const docId = await firebaseChangeRecordsManager.addChangeRecord(newRecord);
                    if (docId) {
                        newRecord.id = docId;
                        newRecord.firestoreId = docId;
                        changeRecords.unshift(newRecord);
                        closeModal();
                        renderChange();
                    } else {
                        alert('Error saving record to Firebase');
                    }
                } else {
                    // Fallback to local storage
                    newRecord.id = Math.max(0, ...changeRecords.map(r => r.id || 0)) + 1;
                    changeRecords.unshift(newRecord);
                    closeModal();
                    renderChange();
                }
            } catch (error) {
                console.error('Error saving change record:', error);
                alert('Error saving record. Please try again.');
            }
        }

        // AI scan for Change Records - analyze money in photo
        async function scanChangeWithAI() {
            const photoInput = document.getElementById('change-photo');

            if (!photoInput || !photoInput.files || !photoInput.files[0]) {
                alert('Please upload a photo of the money first.');
                return;
            }

            const file = photoInput.files[0];
            const isPdf = file.type === 'application/pdf';
            if (isPdf) {
                alert('Please upload an image file (JPG, PNG), not a PDF.');
                return;
            }

            // Show loading state
            const scanBtn = document.getElementById('change-ai-scan-btn');
            const originalText = scanBtn ? scanBtn.innerHTML : '';
            if (scanBtn) {
                scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
                scanBtn.disabled = true;
            }

            try {
                // Convert image to base64
                const base64Image = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });

                const apiKey = getOpenAIKey();

                // Call OpenAI API
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + apiKey
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o',
                        max_tokens: 1024,
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    {
                                        type: 'image_url',
                                        image_url: { url: base64Image }
                                    },
                                    {
                                        type: 'text',
                                        text: `Analyze this image of money/cash and count the bills and coins visible. Return ONLY a JSON object with the count of each denomination (use 0 if not visible):

{
    "bills_100": 0,
    "bills_50": 0,
    "bills_20": 0,
    "bills_10": 0,
    "bills_5": 0,
    "bills_2": 0,
    "bills_1": 0,
    "coins_100": 0,
    "coins_50": 0,
    "coins_25": 0,
    "coins_10": 0,
    "coins_5": 0,
    "coins_1": 0,
    "notes": "any relevant observations about the money"
}

Count each bill/coin you can see clearly. If bills are stacked, try to estimate the count. Return ONLY the JSON object.`
                                    }
                                ]
                            }
                        ]
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error?.message || 'API request failed');
                }

                const data = await response.json();
                const content = data.choices[0].message.content;

                // Parse the JSON response
                let moneyData;
                try {
                    const jsonMatch = content.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        moneyData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found in response');
                    }
                } catch (parseError) {
                    console.error('Error parsing AI response:', content);
                    throw new Error('Could not parse money data from AI response');
                }

                // Fill in the denomination fields
                if (moneyData.bills_100) document.getElementById('change-bills-100').value = moneyData.bills_100;
                if (moneyData.bills_50) document.getElementById('change-bills-50').value = moneyData.bills_50;
                if (moneyData.bills_20) document.getElementById('change-bills-20').value = moneyData.bills_20;
                if (moneyData.bills_10) document.getElementById('change-bills-10').value = moneyData.bills_10;
                if (moneyData.bills_5) document.getElementById('change-bills-5').value = moneyData.bills_5;
                if (moneyData.bills_2) document.getElementById('change-bills-2').value = moneyData.bills_2;
                if (moneyData.bills_1) document.getElementById('change-bills-1').value = moneyData.bills_1;
                if (moneyData.coins_100) document.getElementById('change-coins-100').value = moneyData.coins_100;
                if (moneyData.coins_50) document.getElementById('change-coins-50').value = moneyData.coins_50;
                if (moneyData.coins_25) document.getElementById('change-coins-25').value = moneyData.coins_25;
                if (moneyData.coins_10) document.getElementById('change-coins-10').value = moneyData.coins_10;
                if (moneyData.coins_5) document.getElementById('change-coins-5').value = moneyData.coins_5;
                if (moneyData.coins_1) document.getElementById('change-coins-1').value = moneyData.coins_1;

                // Add notes if any
                if (moneyData.notes) {
                    const notesField = document.getElementById('change-notes');
                    if (notesField) {
                        notesField.value = moneyData.notes;
                    }
                }

                // Recalculate total
                calculateChangeTotal();

                alert('Money counted successfully! Please review the values.');

            } catch (error) {
                console.error('Error scanning change with AI:', error);
                alert('Error scanning: ' + error.message);
            } finally {
                if (scanBtn) {
                    scanBtn.innerHTML = originalText || '<i class="fas fa-magic"></i> Scan with AI';
                    scanBtn.disabled = false;
                }
            }
        }

        /**
         * Initialize Firebase and load gifts from Firestore
         */
        async function initializeFirebaseGifts() {
            try {
                
                // Initialize Firebase manager
                const initialized = await firebaseGiftsManager.initialize();
                
                if (initialized) {
                    try {
                        // Load gifts from Firestore
                        const firestoreGifts = await firebaseGiftsManager.loadGifts();
                        
                        if (firestoreGifts && firestoreGifts.length > 0) {
                            
                            // Map Firestore data to the local giftsRecords array
                            giftsRecords = firestoreGifts.map(gift => ({
                                id: gift.firestoreId || gift.id,
                                firestoreId: gift.firestoreId || gift.id,
                                product: gift.product || '',
                                quantity: gift.quantity || 0,
                                value: gift.value || 0,
                                recipient: gift.recipient || '',
                                recipientType: gift.recipientType || 'customer',
                                reason: gift.reason || '',
                                store: gift.store || 'Miramar',
                                date: gift.date || new Date().toISOString().split('T')[0],
                                notes: gift.notes || '',
                                photo: gift.photo || null,
                                photoPath: gift.photoPath || null
                            }));
                            
                            return true;
                        }
                    } catch (error) {
                        console.error('Error loading gifts from Firestore:', error);
                    }
                } else {
                    console.warn('Firebase not available. Using fallback data.');
                }
            } catch (error) {
                console.error('Error initializing Firebase gifts:', error);
            }
            
            return false;
        }
        window.initializeFirebaseGifts = initializeFirebaseGifts;

        /**
         * Save gift to Firebase
         */
        async function saveGiftToFirebase(giftData) {
            if (!firebaseGiftsManager.isInitialized) {
                console.warn('Firebase Gifts Manager not initialized');
                return null;
            }

            try {
                if (giftData.firestoreId) {
                    // Update existing
                    const success = await firebaseGiftsManager.updateGift(
                        giftData.firestoreId,
                        giftData
                    );
                    return success ? giftData.firestoreId : null;
                } else {
                    // Create new
                    const newId = await firebaseGiftsManager.addGift(giftData);
                    return newId;
                }
            } catch (error) {
                console.error('Error saving gift to Firebase:', error);
                return null;
            }
        }

        /**
         * Delete gift record from Firebase
         */
        async function deleteGiftFromFirebase(firestoreId) {
            if (!firebaseGiftsManager.isInitialized) {
                console.warn('Firebase Gifts Manager not initialized');
                return false;
            }

            try {
                return await firebaseGiftsManager.deleteGift(firestoreId);
            } catch (error) {
                console.error('Error deleting gift from Firebase:', error);
                return false;
            }
        }

        /**
         * Initialize Firebase and load issues from Firestore
         */
        async function initializeFirebaseIssues() {
            try {

                // Initialize Firebase manager
                const initialized = await firebaseIssuesManager.initialize();

                if (initialized) {
                    try {
                        // Load issues from Firestore
                        const firestoreIssues = await firebaseIssuesManager.loadIssues();

                        // Replace local issues with Firestore data (even if empty, to clear dummy data)
                        if (firestoreIssues && firestoreIssues.length > 0) {

                            // Map Firestore data to the local issues array
                            issues = firestoreIssues.map(issue => ({
                                id: issue.firestoreId || issue.id,
                                firestoreId: issue.firestoreId || issue.id,
                                customer: issue.customer || 'Anonymous',
                                phone: issue.phone || '',
                                type: issue.type || 'In Store',
                                store: issue.store || '',
                                description: issue.description || '',
                                incidentDate: issue.incidentDate || '',
                                perception: issue.perception || null,
                                status: issue.status || 'open',
                                createdBy: issue.createdBy || '',
                                createdDate: issue.createdDate || '',
                                solution: issue.solution || null,
                                resolvedBy: issue.resolvedBy || null,
                                resolutionDate: issue.resolutionDate || null,
                                followUpNotes: issue.followUpNotes || '',
                                statusHistory: issue.statusHistory || []
                            }));

                        } else {
                            // Clear local dummy data if Firebase is connected but empty
                            issues = [];
                        }
                        return true;
                    } catch (error) {
                        console.error('Error loading issues from Firestore:', error);
                    }
                } else {
                    console.warn('Firebase not available. Using fallback data.');
                }
            } catch (error) {
                console.error('Error initializing Firebase issues:', error);
            }

            return false;
        }
        window.initializeFirebaseIssues = initializeFirebaseIssues;

        // Initialize Firebase Licenses
        async function initializeFirebaseLicenses() {
            try {
                // Initialize Firebase manager
                const initialized = await firebaseLicensesManager.initialize();

                if (initialized) {
                    try {
                        // Load licenses from Firestore
                        const firestoreLicenses = await firebaseLicensesManager.loadLicenses();

                        if (firestoreLicenses && firestoreLicenses.length > 0) {
                            // Map Firestore data to the local licenses array
                            licenses = firestoreLicenses.map(lic => ({
                                id: lic.firestoreId || lic.id,
                                firestoreId: lic.firestoreId || lic.id,
                                name: lic.name || '',
                                store: lic.store || '',
                                expires: lic.expires || '',
                                status: lic.status || 'valid',
                                file: lic.file || lic.fileName || null,
                                fileName: lic.fileName || null,
                                fileType: lic.fileType || null,
                                fileData: lic.fileData || null,
                                fileUrl: lic.fileUrl || null,
                                filePath: lic.filePath || null,
                                uploadedBy: lic.uploadedBy || null
                            }));

                            return true;
                        } else {
                            console.log('No licenses found in Firestore, using local data');
                        }
                    } catch (error) {
                        console.error('Error loading licenses from Firestore:', error);
                    }
                } else {
                    console.warn('Firebase Licenses not available. Using fallback data.');
                }
            } catch (error) {
                console.error('Error initializing Firebase licenses:', error);
            }

            return false;
        }
        window.initializeFirebaseLicenses = initializeFirebaseLicenses;

        // Function to view/download a license PDF with aesthetic modal preview
        function viewLicensePdf(licenseId) {
            const license = licenses.find(l => l.id === licenseId || l.firestoreId === licenseId);
            if (!license) {
                alert('License not found');
                return;
            }

            // Check for PDF in both fileUrl (Firebase Storage) and fileData (base64)
            const pdfSource = license.fileUrl || license.fileData;
            const hasPdf = !!pdfSource;

            // Determine status color and label
            const statusColors = {
                valid: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: 'Valid' },
                expiring: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: 'Expiring Soon' },
                expired: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'Expired' }
            };
            const statusStyle = statusColors[license.status] || statusColors.valid;

            // Create modal overlay
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'pdf-preview-modal';
            modalOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
                animation: fadeIn 0.2s ease-out;
            `;

            modalOverlay.innerHTML = `
                <style>
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(20px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    #pdf-preview-modal .pdf-modal-container {
                        animation: slideUp 0.3s ease-out;
                    }
                    #pdf-preview-modal .action-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    }
                </style>
                <div class="pdf-modal-container" style="
                    background: var(--bg-primary);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 1000px;
                    height: 90vh;
                    max-height: 900px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    border: 1px solid var(--border-color);
                ">
                    <!-- Header -->
                    <div style="
                        padding: 20px 24px;
                        background: var(--bg-secondary);
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px;
                    ">
                        <div style="display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0;">
                            <div style="
                                width: 48px;
                                height: 48px;
                                background: linear-gradient(135deg, #ef4444, #dc2626);
                                border-radius: 12px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                flex-shrink: 0;
                            ">
                                <i class="fas fa-file-pdf" style="color: white; font-size: 20px;"></i>
                            </div>
                            <div style="min-width: 0; flex: 1;">
                                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${license.name}
                                </h3>
                                <div style="display: flex; align-items: center; gap: 12px; margin-top: 4px; flex-wrap: wrap;">
                                    <span style="font-size: 13px; color: var(--text-muted);">
                                        <i class="fas fa-store" style="margin-right: 4px;"></i>${license.store}
                                    </span>
                                    <span style="font-size: 13px; color: var(--text-muted);">
                                        <i class="fas fa-calendar" style="margin-right: 4px;"></i>Expires: ${formatDate(license.expires)}
                                    </span>
                                    <span style="
                                        font-size: 11px;
                                        font-weight: 600;
                                        padding: 4px 10px;
                                        border-radius: 20px;
                                        background: ${statusStyle.bg};
                                        color: ${statusStyle.color};
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                    ">${statusStyle.label}</span>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                            ${hasPdf ? `
                            <button class="action-btn" onclick="downloadLicensePdf('${licenseId}')" style="
                                padding: 10px 16px;
                                background: var(--accent-primary);
                                color: white;
                                border: none;
                                border-radius: 10px;
                                font-size: 13px;
                                font-weight: 500;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                transition: all 0.2s;
                            ">
                                <i class="fas fa-download"></i>
                                Download
                            </button>
                            ` : ''}
                            <button onclick="closePdfPreviewModal()" style="
                                width: 40px;
                                height: 40px;
                                background: var(--bg-hover);
                                border: 1px solid var(--border-color);
                                border-radius: 10px;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: var(--text-secondary);
                                transition: all 0.2s;
                            ">
                                <i class="fas fa-times" style="font-size: 16px;"></i>
                            </button>
                        </div>
                    </div>

                    <!-- PDF Viewer or No PDF Message -->
                    ${hasPdf ? `
                    <div style="flex: 1; background: #525659; position: relative; overflow: hidden;">
                        <iframe
                            src="${pdfSource}#toolbar=0&navpanes=0&scrollbar=1"
                            style="width: 100%; height: 100%; border: none;"
                            title="PDF Preview"
                        ></iframe>
                    </div>
                    ` : `
                    <div style="flex: 1; background: var(--bg-secondary); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
                        <div style="
                            width: 120px;
                            height: 120px;
                            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
                            border-radius: 24px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-bottom: 24px;
                        ">
                            <i class="fas fa-file-circle-exclamation" style="font-size: 48px; color: #ef4444;"></i>
                        </div>
                        <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: var(--text-primary);">No PDF Attached</h3>
                        <p style="margin: 0 0 32px 0; font-size: 14px; color: var(--text-muted); text-align: center; max-width: 400px;">
                            This document doesn't have a PDF file attached yet. You can upload one by editing the document.
                        </p>

                        <!-- Document Details Card -->
                        <div style="
                            background: var(--bg-primary);
                            border: 1px solid var(--border-color);
                            border-radius: 16px;
                            padding: 24px;
                            width: 100%;
                            max-width: 400px;
                        ">
                            <h4 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
                                <i class="fas fa-info-circle" style="margin-right: 8px;"></i>Document Details
                            </h4>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 13px; color: var(--text-muted);">Name</span>
                                    <span style="font-size: 14px; font-weight: 500; color: var(--text-primary);">${license.name}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 13px; color: var(--text-muted);">Store</span>
                                    <span style="font-size: 14px; font-weight: 500; color: var(--text-primary);">${license.store}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 13px; color: var(--text-muted);">Expires</span>
                                    <span style="font-size: 14px; font-weight: 500; color: var(--text-primary);">${formatDate(license.expires)}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 13px; color: var(--text-muted);">Status</span>
                                    <span style="
                                        font-size: 12px;
                                        font-weight: 600;
                                        padding: 4px 12px;
                                        border-radius: 20px;
                                        background: ${statusStyle.bg};
                                        color: ${statusStyle.color};
                                        text-transform: uppercase;
                                    ">${statusStyle.label}</span>
                                </div>
                                ${license.uploadedBy ? `
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 13px; color: var(--text-muted);">Uploaded by</span>
                                    <span style="font-size: 14px; font-weight: 500; color: var(--text-primary);">${license.uploadedBy}</span>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    `}

                    <!-- Footer -->
                    <div style="
                        padding: 12px 24px;
                        background: var(--bg-secondary);
                        border-top: 1px solid var(--border-color);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    ">
                        <span style="font-size: 12px; color: var(--text-muted);">
                            ${license.uploadedBy ? `<i class="fas fa-user" style="margin-right: 4px;"></i>Uploaded by ${license.uploadedBy}` : ''}
                        </span>
                        <span style="font-size: 12px; color: var(--text-muted);">
                            Press <kbd style="padding: 2px 6px; background: var(--bg-hover); border-radius: 4px; font-family: monospace;">ESC</kbd> to close
                        </span>
                    </div>
                </div>
            `;

            document.body.appendChild(modalOverlay);

            // Close on overlay click
            modalOverlay.addEventListener('mousedown', (e) => {
                if (e.target === modalOverlay) {
                    closePdfPreviewModal();
                }
            });

            // Close on ESC key
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    closePdfPreviewModal();
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
        }

        // Close PDF preview modal
        function closePdfPreviewModal() {
            const modal = document.getElementById('pdf-preview-modal');
            if (modal) {
                modal.style.opacity = '0';
                modal.style.transition = 'opacity 0.2s ease-out';
                setTimeout(() => modal.remove(), 200);
            }
        }

        // Download license PDF
        function downloadLicensePdf(licenseId) {
            const license = licenses.find(l => l.id === licenseId || l.firestoreId === licenseId);
            const pdfSource = license?.fileUrl || license?.fileData;
            if (!license || !pdfSource) return;

            const link = document.createElement('a');
            link.href = pdfSource;
            link.download = license.fileName || `${license.name}.pdf`;
            link.target = '_blank'; // For Firebase Storage URLs
            link.click();
        }

        // Open license in new tab
        function openLicenseInNewTab(licenseId) {
            const license = licenses.find(l => l.id === licenseId || l.firestoreId === licenseId);
            const pdfSource = license?.fileUrl || license?.fileData;
            if (!license || !pdfSource) return;

            window.open(pdfSource, '_blank');
        }

        /**
         * Generic Document Preview Modal
         * Shows a beautiful preview modal for any document (PDF, images, etc.)
         * @param {Object} docInfo - Document information object
         * @param {string} docInfo.url - URL or base64 data of the document
         * @param {string} docInfo.fileName - Name of the file
         * @param {string} docInfo.fileType - MIME type of the file
         * @param {string} docInfo.fileSize - Size of the file (formatted string or number)
         * @param {string} docInfo.documentType - Type/category of document (e.g., "ID Document", "Contract")
         * @param {string} docInfo.uploadedBy - Who uploaded the document
         * @param {Date|string} docInfo.uploadedAt - When the document was uploaded
         */
        function showDocumentPreview(docInfo) {
            if (!docInfo || !docInfo.url) {
                alert('Document not found');
                return;
            }

            const isPdf = docInfo.fileType?.includes('pdf') || docInfo.fileName?.toLowerCase().endsWith('.pdf');
            const isImage = docInfo.fileType?.includes('image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(docInfo.fileName || '');

            // Format file size if it's a number
            const fileSize = typeof docInfo.fileSize === 'number' ? formatFileSize(docInfo.fileSize) : (docInfo.fileSize || 'Unknown size');

            // Format date
            let uploadDate = '';
            if (docInfo.uploadedAt) {
                const date = docInfo.uploadedAt.toDate ? docInfo.uploadedAt.toDate() : new Date(docInfo.uploadedAt);
                uploadDate = formatDate(date);
            }

            // Create modal overlay
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'document-preview-modal';
            modalOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(8px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
                animation: docFadeIn 0.2s ease-out;
            `;

            // Get icon and color based on file type
            let iconClass = 'fa-file';
            let iconGradient = 'linear-gradient(135deg, #6366f1, #4f46e5)';
            if (isPdf) {
                iconClass = 'fa-file-pdf';
                iconGradient = 'linear-gradient(135deg, #ef4444, #dc2626)';
            } else if (isImage) {
                iconClass = 'fa-file-image';
                iconGradient = 'linear-gradient(135deg, #10b981, #059669)';
            } else if (docInfo.fileType?.includes('word') || docInfo.fileName?.includes('.doc')) {
                iconClass = 'fa-file-word';
                iconGradient = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            } else if (docInfo.fileType?.includes('excel') || docInfo.fileName?.includes('.xls')) {
                iconClass = 'fa-file-excel';
                iconGradient = 'linear-gradient(135deg, #22c55e, #16a34a)';
            }

            modalOverlay.innerHTML = `
                <style>
                    @keyframes docFadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes docSlideUp {
                        from { opacity: 0; transform: translateY(20px) scale(0.98); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    #document-preview-modal .doc-modal-container {
                        animation: docSlideUp 0.3s ease-out;
                    }
                    #document-preview-modal .doc-action-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    }
                </style>
                <div class="doc-modal-container" style="
                    background: var(--bg-primary);
                    border-radius: 20px;
                    width: 100%;
                    max-width: 1000px;
                    height: 90vh;
                    max-height: 900px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    border: 1px solid var(--border-color);
                ">
                    <!-- Header -->
                    <div style="
                        padding: 20px 24px;
                        background: var(--bg-secondary);
                        border-bottom: 1px solid var(--border-color);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 16px;
                    ">
                        <div style="display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0;">
                            <div style="
                                width: 48px;
                                height: 48px;
                                background: ${iconGradient};
                                border-radius: 12px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                flex-shrink: 0;
                            ">
                                <i class="fas ${iconClass}" style="color: white; font-size: 20px;"></i>
                            </div>
                            <div style="min-width: 0; flex: 1;">
                                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${docInfo.fileName || 'Document'}
                                </h3>
                                <div style="display: flex; align-items: center; gap: 12px; margin-top: 4px; flex-wrap: wrap;">
                                    ${docInfo.documentType ? `<span style="font-size: 13px; color: var(--text-muted);"><i class="fas fa-tag" style="margin-right: 4px;"></i>${docInfo.documentType}</span>` : ''}
                                    <span style="font-size: 13px; color: var(--text-muted);">
                                        <i class="fas fa-file" style="margin-right: 4px;"></i>${fileSize}
                                    </span>
                                    ${uploadDate ? `<span style="font-size: 13px; color: var(--text-muted);"><i class="fas fa-calendar" style="margin-right: 4px;"></i>${uploadDate}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                            <button class="doc-action-btn" onclick="downloadDocument('${docInfo.url}', '${docInfo.fileName || 'document'}')" style="
                                padding: 10px 16px;
                                background: var(--accent-primary);
                                color: white;
                                border: none;
                                border-radius: 10px;
                                font-size: 13px;
                                font-weight: 500;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                                transition: all 0.2s;
                            ">
                                <i class="fas fa-download"></i>
                                Download
                            </button>
                            <button onclick="closeDocumentPreviewModal()" style="
                                width: 40px;
                                height: 40px;
                                background: var(--bg-hover);
                                border: 1px solid var(--border-color);
                                border-radius: 10px;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                color: var(--text-secondary);
                                transition: all 0.2s;
                            ">
                                <i class="fas fa-times" style="font-size: 16px;"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Document Viewer -->
                    ${isPdf ? `
                    <div style="flex: 1; background: #525659; position: relative; overflow: hidden;">
                        <iframe
                            src="${docInfo.url}#toolbar=0&navpanes=0&scrollbar=1"
                            style="width: 100%; height: 100%; border: none;"
                            title="Document Preview"
                        ></iframe>
                    </div>
                    ` : isImage ? `
                    <div style="flex: 1; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; padding: 20px; overflow: auto;">
                        <img src="${docInfo.url}" alt="${docInfo.fileName || 'Document'}" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                    </div>
                    ` : `
                    <div style="flex: 1; background: var(--bg-secondary); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
                        <div style="
                            width: 120px;
                            height: 120px;
                            background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(79, 70, 229, 0.1));
                            border-radius: 24px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-bottom: 24px;
                        ">
                            <i class="fas ${iconClass}" style="font-size: 48px; color: #6366f1;"></i>
                        </div>
                        <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: var(--text-primary);">Preview Not Available</h3>
                        <p style="margin: 0 0 24px 0; font-size: 14px; color: var(--text-muted); text-align: center; max-width: 400px;">
                            This file type cannot be previewed in the browser. Click download to view the file.
                        </p>
                    </div>
                    `}

                    <!-- Footer -->
                    <div style="
                        padding: 12px 24px;
                        background: var(--bg-secondary);
                        border-top: 1px solid var(--border-color);
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    ">
                        <span style="font-size: 12px; color: var(--text-muted);">
                            ${docInfo.uploadedBy ? `<i class="fas fa-user" style="margin-right: 4px;"></i>Uploaded by ${docInfo.uploadedBy}` : ''}
                        </span>
                        <span style="font-size: 12px; color: var(--text-muted);">
                            Press <kbd style="padding: 2px 6px; background: var(--bg-hover); border-radius: 4px; font-family: monospace;">ESC</kbd> to close
                        </span>
                    </div>
                </div>
            `;

            document.body.appendChild(modalOverlay);

            // Close on overlay click
            modalOverlay.addEventListener('mousedown', (e) => {
                if (e.target === modalOverlay) {
                    closeDocumentPreviewModal();
                }
            });

            // Close on ESC key
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    closeDocumentPreviewModal();
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            document.addEventListener('keydown', handleEsc);
        }

        // Close document preview modal
        function closeDocumentPreviewModal() {
            const modal = document.getElementById('document-preview-modal');
            if (modal) {
                modal.style.opacity = '0';
                modal.style.transition = 'opacity 0.2s ease-out';
                setTimeout(() => modal.remove(), 200);
            }
        }

        // Download document helper
        function downloadDocument(url, fileName) {
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank';
            link.click();
        }

        // Function to delete a license (deletes immediately from Firebase)
        function deleteLicense(licenseId) {
            const license = licenses.find(l => l.id === licenseId || l.firestoreId === licenseId);
            if (!license) return;

            showConfirmModal({
                title: 'Delete License/Document',
                message: `Are you sure you want to delete "${license.name}"? This action cannot be undone.`,
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    const licenseName = license.name;
                    const firestoreId = license.firestoreId || license.id;

                    // Remove from local array immediately for UI feedback
                    licenses = licenses.filter(l => l.id !== licenseId && l.firestoreId !== licenseId);
                    renderLicenses();

                    // Delete from Firebase
                    try {
                        if (firebaseLicensesManager && firebaseLicensesManager.isInitialized) {
                            await firebaseLicensesManager.deleteLicense(firestoreId);
                            showToast(`"${licenseName}" deleted successfully`, 'success');
                        }
                    } catch (error) {
                        console.error('❌ Error deleting license from Firebase:', error);
                        showToast('Error deleting document. Please try again.', 'error');
                        // Reload licenses to restore state
                        await initializeFirebaseLicenses();
                        renderLicenses();
                    }
                }
            });
        }

        // Gifts Functions - Control de Regalos en Especie
    function getGiftsAvailableMonths() {
        if (!Array.isArray(giftsRecords) || giftsRecords.length === 0) {
            return [];
        }

        const monthsSet = new Set();
        giftsRecords.forEach(record => {
            if (!record.date) {
                return;
            }

            const monthKey = record.date.slice(0, 7);
            if (/^\d{4}-\d{2}$/.test(monthKey)) {
                monthsSet.add(monthKey);
            }
        });

        return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
    }

        const todayMonthKey = new Date().toISOString().slice(0, 7);
        const initialAvailableMonths = getGiftsAvailableMonths();

        if (initialAvailableMonths.length > 0) {
            giftsCurrentMonth = initialAvailableMonths.includes(todayMonthKey)
                ? todayMonthKey
                : initialAvailableMonths[0];
        } else {
            giftsCurrentMonth = todayMonthKey;
        }

        // Gifts view mode state
        let giftsViewMode = 'list'; // 'list' or 'grid'

        // Renderizar inicial
        renderGifts();

        function renderGifts() {
            const dashboard = document.querySelector('.dashboard');
            const availableMonths = getGiftsAvailableMonths();

            if (availableMonths.length > 0 && !availableMonths.includes(giftsCurrentMonth)) {
                giftsCurrentMonth = availableMonths[0];
            }

            // Filter by current month
            const monthlyRecords = giftsRecords.filter(r => r.date && r.date.startsWith(giftsCurrentMonth));
            const monthlyTotal = monthlyRecords.reduce((sum, r) => sum + r.value, 0);
            const monthlyItems = monthlyRecords.reduce((sum, r) => sum + r.quantity, 0);
            const monthName = new Date(giftsCurrentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

            dashboard.innerHTML = `
                <div class="page-header">
                    <div class="page-header-left">
                        <h2 class="section-title">Comp Tracking</h2>
                        <p class="section-subtitle">Product Comps & Giveaways</p>
                    </div>
                    <button class="btn-primary floating-add-btn" onclick="openModal('add-gift')">
                        <i class="fas fa-plus"></i>
                        Register Comp
                    </button>
                </div>

                <!-- Monthly Total Card -->
                <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); border-radius: 16px; padding: 30px 40px; margin-bottom: 24px; position: relative; overflow: hidden;">
                    <div style="position: absolute; right: -30px; top: 50%; transform: translateY(-50%); width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,0.1);"></div>
                    <div style="position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; letter-spacing: 1px; margin-bottom: 8px;">${monthName}</div>
                            <div style="color: white; font-size: 42px; font-weight: 700; margin-bottom: 4px;">$${monthlyTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                            <div style="color: rgba(255,255,255,0.8); font-size: 14px;">${monthlyRecords.length} gift${monthlyRecords.length !== 1 ? 's' : ''} (${monthlyItems} items) this month</div>
                        </div>
                        <select class="form-input" style="width: 150px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white;" onchange="changeGiftsMonth(this.value)">
                            ${availableMonths.map(month => {
                                const [year, monthNum] = month.split('-');
                                const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
                                const displayMonth = date.toLocaleDateString('en-US', { month: 'short' });
                                const displayYear = date.getFullYear();
                                const label = `${displayMonth} - ${displayYear}`;
                                return `<option value="${month}" ${month === giftsCurrentMonth ? 'selected' : ''} style="color: black;">${label}</option>`;
                            }).join('')}
                        </select>
                    </div>
                </div>

                <!-- Filters -->
                <div class="card" style="margin-bottom: 24px;">
                    <div class="card-body" style="padding: 12px 16px;">
                        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label style="font-weight: 500; color: var(--text-secondary);">Store:</label>
                                <select class="form-input" id="gifts-store-filter" style="width: 180px;" onchange="filterGiftsTable()">
                                    <option value="all">All Stores</option>
                                    <option value="Miramar">Miramar</option>
                                    <option value="Morena">Morena</option>
                                    <option value="Kearny Mesa">Kearny Mesa</option>
                                    <option value="Chula Vista">Chula Vista</option>
                                    <option value="North Park">North Park</option>
                                    <option value="Miramar Wine & Liquor">Miramar Wine & Liquor</option>
                                </select>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <label style="font-weight: 500; color: var(--text-secondary);">Recipient:</label>
                                <select class="form-input" id="gifts-type-filter" style="width: 150px;" onchange="filterGiftsTable()">
                                    <option value="all">All Types</option>
                                    <option value="customer">Customer</option>
                                    <option value="vendor">Vendor</option>
                                    <option value="employee">Employee</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <!-- View Toggle -->
                            <div style="display: flex; background: var(--bg-primary); border-radius: 8px; padding: 3px; border: 1px solid var(--border-color); margin-left: auto;">
                                <button onclick="setGiftsViewMode('list')" id="gifts-view-list-btn" style="width: 34px; height: 34px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${giftsViewMode === 'list' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="List View">
                                    <i class="fas fa-list"></i>
                                </button>
                                <button onclick="setGiftsViewMode('grid')" id="gifts-view-grid-btn" style="width: 34px; height: 34px; border-radius: 6px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; ${giftsViewMode === 'grid' ? 'background: var(--accent-primary); color: white;' : 'background: transparent; color: var(--text-muted);'}" title="Grid View">
                                    <i class="fas fa-th-large"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Gifts Table/Grid -->
                <div class="card">
                    <div class="card-body" style="padding: ${giftsViewMode === 'grid' ? '20px' : '0'};" id="gifts-container">
                        ${monthlyRecords.length === 0 ? `
                            <div style="padding: 60px; text-align: center; color: var(--text-muted);">
                                <i class="fas fa-gift" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                                <h3 style="margin-bottom: 8px; color: var(--text-secondary);">No Gifts This Month</h3>
                                <p>Click "Register Gift" to add a new record</p>
                            </div>
                        ` : giftsViewMode === 'grid' ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;" id="giftsGridContainer">
                                ${renderGiftsGridCards(monthlyRecords)}
                            </div>
                        ` : `
                            <table class="data-table" style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Value</th>
                                        <th>Recipient</th>
                                        <th>Type</th>
                                        <th>Details</th>
                                        <th>Store</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="giftsTableBody">
                                    ${renderGiftsTableRows(monthlyRecords)}
                                </tbody>
                            </table>
                        `}
                    </div>
                </div>
            `;
        }

        function changeGiftsMonth(monthKey) {
            if (!monthKey) {
                return;
            }

            giftsCurrentMonth = monthKey;
            renderGifts();
        }

        function renderGiftsTableRows(records) {
            if (records.length === 0) return '';

            return records.map(gift => `
                <tr>
                    <td>${new Date(gift.date).toLocaleDateString()}</td>
                    <td>
                        <div style="font-weight: 500;">${gift.product}</div>
                        ${gift.notes ? `<div style="font-size: 11px; color: var(--text-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${gift.notes}</div>` : ''}
                    </td>
                    <td style="text-align: center;">${gift.quantity}</td>
                    <td style="font-weight: 600; color: var(--danger);">$${gift.value.toFixed(2)}</td>
                    <td>${gift.recipient}</td>
                    <td>
                        <span class="status-badge ${gift.recipientType === 'customer' ? 'active' : gift.recipientType === 'vendor' ? 'warning' : 'inactive'}">
                            ${gift.recipientType.charAt(0).toUpperCase() + gift.recipientType.slice(1)}
                        </span>
                    </td>
                    <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${gift.reason}">${gift.reason}</td>
                    <td>
                        <span style="background: var(--bg-tertiary); padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                            ${gift.store}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn-icon" onclick="viewGiftDetails('${String(gift.id).replace(/'/g, "\\'")}');" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="editGift('${String(gift.id).replace(/'/g, "\\'")}');" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteGift('${String(gift.id).replace(/'/g, "\\'")}');" title="Delete" style="color: var(--danger);">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        function filterGiftsTable() {
            const storeFilter = document.getElementById('gifts-store-filter')?.value || 'all';
            const typeFilter = document.getElementById('gifts-type-filter')?.value || 'all';

            // Start with monthly records
            let filteredRecords = giftsRecords.filter(r => r.date && r.date.startsWith(giftsCurrentMonth));

            // Apply store filter
            if (storeFilter !== 'all') {
                filteredRecords = filteredRecords.filter(r => r.store === storeFilter);
            }

            // Apply type filter
            if (typeFilter !== 'all') {
                filteredRecords = filteredRecords.filter(r => r.recipientType === typeFilter);
            }

            // Update based on current view mode
            if (giftsViewMode === 'grid') {
                const gridContainer = document.getElementById('giftsGridContainer');
                if (gridContainer) {
                    gridContainer.innerHTML = renderGiftsGridCards(filteredRecords);
                }
            } else {
                const tbody = document.getElementById('giftsTableBody');
                if (tbody) {
                    tbody.innerHTML = renderGiftsTableRows(filteredRecords);
                }
            }
        }

        // Render gifts as grid cards
        function renderGiftsGridCards(records) {
            if (records.length === 0) return '';

            return records.map(gift => {
                const typeColors = {
                    customer: { bg: '#10b98120', color: '#10b981' },
                    vendor: { bg: '#f59e0b20', color: '#f59e0b' },
                    employee: { bg: '#6366f120', color: '#6366f1' },
                    other: { bg: '#64748b20', color: '#64748b' }
                };
                const typeStyle = typeColors[gift.recipientType] || typeColors.other;

                return `
                    <div class="gift-grid-card" style="background: var(--bg-secondary); border-radius: 16px; overflow: hidden; border: 1px solid var(--border-color); transition: all 0.2s; display: flex; flex-direction: column;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); padding: 16px 20px; color: white;">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">${new Date(gift.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                    <div style="font-size: 24px; font-weight: 700;">$${gift.value.toFixed(2)}</div>
                                </div>
                                <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-gift" style="font-size: 20px;"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Body -->
                        <div style="padding: 16px 20px; flex: 1;">
                            <!-- Product -->
                            <div style="font-weight: 600; font-size: 15px; color: var(--text-primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${gift.product}</span>
                                <span style="background: var(--bg-primary); padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500; color: var(--text-muted);">×${gift.quantity}</span>
                            </div>

                            <!-- Recipient Info -->
                            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                                <span style="background: ${typeStyle.bg}; color: ${typeStyle.color}; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase;">
                                    ${gift.recipientType}
                                </span>
                                <span style="background: var(--bg-primary); padding: 4px 10px; border-radius: 12px; font-size: 11px; color: var(--text-secondary);">
                                    ${gift.store}
                                </span>
                            </div>

                            <!-- Recipient Name -->
                            <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
                                <i class="fas fa-user" style="margin-right: 6px; opacity: 0.6;"></i>${gift.recipient}
                            </div>

                            <!-- Reason -->
                            ${gift.reason ? `
                                <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                                    ${gift.reason}
                                </div>
                            ` : ''}
                        </div>

                        <!-- Footer -->
                        <div style="padding: 12px 20px; border-top: 1px solid var(--border-color); display: flex; gap: 8px; justify-content: flex-end;">
                            <button class="btn-icon" onclick="viewGiftDetails('${String(gift.id).replace(/'/g, "\\'")}');" title="View Details" style="width: 32px; height: 32px;">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" onclick="editGift('${String(gift.id).replace(/'/g, "\\'")}');" title="Edit" style="width: 32px; height: 32px;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteGift('${String(gift.id).replace(/'/g, "\\'")}');" title="Delete" style="width: 32px; height: 32px; color: var(--danger);">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Set Gifts view mode (list or grid)
        function setGiftsViewMode(mode) {
            giftsViewMode = mode;

            // Update button styles
            const listBtn = document.getElementById('gifts-view-list-btn');
            const gridBtn = document.getElementById('gifts-view-grid-btn');

            if (listBtn && gridBtn) {
                if (mode === 'list') {
                    listBtn.style.background = 'var(--accent-primary)';
                    listBtn.style.color = 'white';
                    gridBtn.style.background = 'transparent';
                    gridBtn.style.color = 'var(--text-muted)';
                } else {
                    gridBtn.style.background = 'var(--accent-primary)';
                    gridBtn.style.color = 'white';
                    listBtn.style.background = 'transparent';
                    listBtn.style.color = 'var(--text-muted)';
                }
            }

            // Re-render the page
            renderGifts();
        }

        function viewGiftDetails(id) {
            // Convert to number if it's a numeric string
            const giftId = typeof id === 'string' && !isNaN(id) ? parseInt(id) : id;
            const gift = giftsRecords.find(r => r.id === giftId);
            if (!gift) return;

            const modal = document.getElementById('modal');
            const modalContent = document.getElementById('modal-content');

            modalContent.innerHTML = `
                <div class="modal-header">
                    <h2 style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-gift" style="color: var(--accent-primary);"></i>
                        Gift Details
                    </h2>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; gap: 16px;">
                        <div class="card" style="background: var(--bg-tertiary);">
                            <div class="card-body">
                                <h3 style="margin: 0 0 12px 0; color: var(--text-primary);">${gift.product}</h3>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Quantity</div>
                                        <div style="font-weight: 600;">${gift.quantity}</div>
                                    </div>
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Value</div>
                                        <div style="font-weight: 600; color: var(--danger);">$${gift.value.toFixed(2)}</div>
                                    </div>
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Date</div>
                                        <div style="font-weight: 500;">${new Date(gift.date).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Store</div>
                                        <div style="font-weight: 500;">${gift.store}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card" style="background: var(--bg-tertiary);">
                            <div class="card-body">
                                <h4 style="margin: 0 0 12px 0; color: var(--text-primary);">
                                    <i class="fas fa-user" style="margin-right: 8px;"></i>Recipient
                                </h4>
                                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Name</div>
                                        <div style="font-weight: 600;">${gift.recipient}</div>
                                    </div>
                                    <div>
                                        <div style="color: var(--text-muted); font-size: 12px;">Type</div>
                                        <span class="status-badge ${gift.recipientType === 'customer' ? 'active' : gift.recipientType === 'vendor' ? 'warning' : 'inactive'}">
                                            ${gift.recipientType.charAt(0).toUpperCase() + gift.recipientType.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card" style="background: var(--bg-tertiary);">
                            <div class="card-body">
                                <h4 style="margin: 0 0 12px 0; color: var(--text-primary);">
                                    <i class="fas fa-clipboard-list" style="margin-right: 8px;"></i>Reason
                                </h4>
                                <p style="margin: 0; line-height: 1.6; color: var(--text-secondary);">${gift.reason}</p>
                            </div>
                        </div>

                        ${gift.notes ? `
                            <div class="card" style="background: var(--bg-tertiary);">
                                <div class="card-body">
                                    <h4 style="margin: 0 0 12px 0; color: var(--text-primary);">
                                        <i class="fas fa-sticky-note" style="margin-right: 8px;"></i>Notes
                                    </h4>
                                    <p style="margin: 0; line-height: 1.6; color: var(--text-secondary);">${gift.notes}</p>
                                </div>
                            </div>
                        ` : ''}

                        ${gift.photo ? `
                            <div class="card" style="background: var(--bg-tertiary);">
                                <div class="card-body">
                                    <h4 style="margin: 0 0 12px 0; color: var(--text-primary);">
                                        <i class="fas fa-camera" style="margin-right: 8px;"></i>Photo
                                    </h4>
                                    <div style="text-align: center;">
                                        <img src="${gift.photo}" alt="Gift photo" style="max-width: 100%; max-height: 300px; border-radius: 8px; object-fit: contain; cursor: pointer;" onclick="showImageModal('${gift.photo}', '${gift.product.replace(/'/g, "\\'")} - Gift Photo')">
                                        <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">Click to view full size</div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div style="display: flex; gap: 12px; margin-top: 20px;">
                        <button class="btn-secondary" style="flex: 1;" onclick="editGift('${String(gift.id).replace(/'/g, "\\'")}'); closeModal();">
                            <i class="fas fa-edit"></i>
                            Edit Gift
                        </button>
                        <button class="btn-secondary" style="flex: 1; background: var(--danger); color: white; border-color: var(--danger);" onclick="closeModal(); deleteGift('${String(gift.id).replace(/'/g, "\\'")}');">
                            <i class="fas fa-trash"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;

            modal.classList.add('active');
        }

        function editGift(id) {
            // Convert to number if it's a numeric string
            const giftId = typeof id === 'string' && !isNaN(id) ? parseInt(id) : id;
            closeModal();
            setTimeout(() => openModal('edit-gift', giftId), 100);
        }

        function deleteGift(id) {
            // Convert to number if it's a numeric string
            const giftId = typeof id === 'string' && !isNaN(id) ? parseInt(id) : id;
            const gift = giftsRecords.find(r => r.id === giftId);
            const productName = gift?.product || 'this gift record';

            showConfirmModal({
                title: 'Delete Gift Record',
                message: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
                confirmText: 'Delete',
                type: 'danger',
                onConfirm: async () => {
                    if (gift) {
                        // Try to delete from Firebase
                        if (gift.firestoreId) {
                            const success = await deleteGiftFromFirebase(gift.firestoreId);
                            if (!success) {
                                console.warn('Failed to delete from Firebase, but deleting locally');
                            }
                        }
                    }
                    giftsRecords = giftsRecords.filter(r => r.id !== giftId);
                    renderGifts();
                }
            });
        }

        async function saveGift(isEdit = false, giftId = null) {
            const product = document.getElementById('gift-product').value.trim();
            const quantity = parseInt(document.getElementById('gift-quantity').value);
            const value = parseFloat(document.getElementById('gift-value').value);
            const recipient = document.getElementById('gift-recipient').value.trim();
            const recipientType = document.getElementById('gift-recipient-type').value;
            const reason = document.getElementById('gift-reason').value.trim();
            const store = document.getElementById('gift-store').value;
            const date = document.getElementById('gift-date').value;
            const notes = document.getElementById('gift-notes').value.trim();
            const photoInput = document.getElementById('gift-photo');

            if (!product) {
                alert('Please enter a product name');
                return;
            }

            try {
                if (isEdit && giftId) {
                    // Convert giftId to number if it's a string
                    const numericGiftId = typeof giftId === 'string' && !isNaN(giftId) ? parseInt(giftId) : giftId;
                    const gift = giftsRecords.find(r => r.id === numericGiftId);
                    if (gift) {
                        const giftData = {
                            product,
                            quantity,
                            value,
                            recipient,
                            recipientType,
                            reason,
                            store,
                            date,
                            notes,
                            photo: gift.photo || null,
                            photoPath: gift.photoPath || null
                        };

                        // Upload photo to Firebase Storage if new one provided
                        if (photoInput && photoInput.files.length > 0) {
                            const rawBase64 = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = (e) => resolve(e.target.result);
                                reader.readAsDataURL(photoInput.files[0]);
                            });

                            // Initialize storage helper if needed
                            if (!firebaseStorageHelper.isInitialized) {
                                firebaseStorageHelper.initialize();
                            }

                            // Delete old photo from Storage if exists
                            if (gift.photoPath) {
                                try {
                                    await firebaseStorageHelper.deleteFile(gift.photoPath);
                                } catch (err) {
                                    console.error('Error deleting old gift photo from Storage:', err);
                                }
                            }

                            try {
                                const uploadResult = await firebaseStorageHelper.uploadImage(
                                    rawBase64,
                                    'gifts/photos',
                                    gift.firestoreId || numericGiftId.toString()
                                );
                                giftData.photo = uploadResult.url;
                                giftData.photoPath = uploadResult.path;
                            } catch (err) {
                                console.error('Error uploading gift photo to Storage:', err);
                                // Fallback to compressed base64
                                try {
                                    giftData.photo = await compressImage(rawBase64);
                                } catch (compressErr) {
                                    giftData.photo = rawBase64;
                                }
                            }
                        }

                        // Update Firebase if it has a firestoreId
                        if (gift.firestoreId) {
                            giftData.firestoreId = gift.firestoreId;
                            const result = await saveGiftToFirebase(giftData);
                            if (!result) {
                                console.error('Failed to update gift in Firebase');
                            }
                        }

                        gift.product = product;
                        gift.quantity = quantity;
                        gift.value = value;
                        gift.recipient = recipient;
                        gift.recipientType = recipientType;
                        gift.reason = reason;
                        gift.store = store;
                        gift.date = date;
                        gift.notes = notes;
                        gift.photo = giftData.photo;
                        gift.photoPath = giftData.photoPath;
                    } else {
                        alert('Gift record not found');
                        return;
                    }
                } else {
                    // Upload photo to Firebase Storage if provided
                    let photoUrl = null;
                    let photoPath = null;
                    if (photoInput && photoInput.files.length > 0) {
                        const rawBase64 = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolve(e.target.result);
                            reader.readAsDataURL(photoInput.files[0]);
                        });

                        // Initialize storage helper if needed
                        if (!firebaseStorageHelper.isInitialized) {
                            firebaseStorageHelper.initialize();
                        }

                        try {
                            const tempId = Date.now().toString();
                            const uploadResult = await firebaseStorageHelper.uploadImage(
                                rawBase64,
                                'gifts/photos',
                                tempId
                            );
                            photoUrl = uploadResult.url;
                            photoPath = uploadResult.path;
                        } catch (err) {
                            console.error('Error uploading gift photo to Storage:', err);
                            // Fallback to compressed base64
                            try {
                                photoUrl = await compressImage(rawBase64);
                            } catch (compressErr) {
                                photoUrl = rawBase64;
                            }
                        }
                    }

                    const giftData = {
                        product,
                        quantity,
                        value,
                        recipient,
                        recipientType,
                        reason,
                        store,
                        date,
                        notes,
                        photo: photoUrl,       // Now stores URL instead of base64
                        photoPath: photoPath   // For future deletion
                    };

                    // Save to Firebase
                    const firestoreId = await saveGiftToFirebase(giftData);

                    const newGift = {
                        id: Math.max(0, ...giftsRecords.map(r => r.id)) + 1,
                        firestoreId: firestoreId || undefined,
                        ...giftData
                    };
                    giftsRecords.unshift(newGift);
                }

                closeModal();
                renderGifts();
            } catch (error) {
                console.error('Error saving gift:', error);
                alert('Error saving gift. Please try again.');
            }
        }

