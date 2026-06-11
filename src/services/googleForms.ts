export interface FormsCreationResult {
  formId: string;
  formUrl: string;
  responderUrl: string;
}

/**
 * Creates a custom Google Form for Vehicle Inspection (استمارة فحص جاهزية المركبة)
 */
export const createInspectionForm = async (
  accessToken: string,
  vehicleInfo: { make: string; model: string; year?: string | number; id?: string }
): Promise<FormsCreationResult> => {
  const formTitle = `استمارة فحص دوري: ${vehicleInfo.make} ${vehicleInfo.model} ${vehicleInfo.year || ''}`;
  
  // 1. Create a blank form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      info: {
        title: formTitle,
        documentTitle: `أوتو كير - فحص ${vehicleInfo.make}`,
        description: `استمارة الفحص الدوري وجاهزية المركبة للتأكد من السلامة وتوثيق الأعطال والصيانة في تطبيق أوتو كير.`
      }
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Form');
  }

  const form = await createRes.json();
  const formId = form.formId;
  const formUrl = `https://docs.google.com/forms/d/${formId}/edit`;
  const responderUrl = form.responderUrl;

  // 2. Add questions using batchUpdate
  const batchRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          createItem: {
            item: {
              title: "رقم اللوحة ومعرف المركبة الخاضعة للفحص",
              description: "أدخل رقم اللوحة الحالية (مثال: أ ب ج 1234)",
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {
                    paragraph: false
                  }
                }
              }
            },
            location: { index: 0 }
          }
        },
        {
          createItem: {
            item: {
              title: "قراءة العداد الحالية (المنقضية - كيلومتر)",
              description: "قراءة الكيلومترات الحالية في طبلون السيارة بوضوح",
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {
                    paragraph: false
                  }
                }
              }
            },
            location: { index: 1 }
          }
        },
        {
          createItem: {
            item: {
              title: "حالة زيت المحرك وسوائل التبريد (الرديتر)",
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: "RADIO",
                    options: [
                      { value: "ممتاز وطبيعي (لا يحتاج تزويد)" },
                      { value: "ناقص ويجب تزويد السوائل فوراً" },
                      { value: "منتهي اللزوجة ومستهلك (تجب التصفية والتغيير)" }
                    ]
                  }
                }
              }
            },
            location: { index: 2 }
          }
        },
        {
          createItem: {
            item: {
              title: "فحص الإطارات ومنظومة الفرامل (المكابح)",
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: "RADIO",
                    options: [
                      { value: "سليمة وجاهزة ومستوى الهواء ممتاز" },
                      { value: "توجد إطارات متآكلة أو ضغطها منخفض" },
                      { value: "فحمات الفرامل تصدر صوتاً وتحتاج صيانة عاجلة" }
                    ]
                  }
                }
              }
            },
            location: { index: 3 }
          }
        },
        {
          createItem: {
            item: {
              title: "هل توجد لمبات تحذيرية مضاءة في طبلون السيارة؟",
              questionItem: {
                question: {
                  choiceQuestion: {
                    type: "CHECKBOX",
                    options: [
                      { value: "لمبة فحص المحرك (Check Engine)" },
                      { value: "لمبة الفرامل أو المكابح المانعة للانزلاق (ABS)" },
                      { value: "لمبة ضغط الهواء بالإطارات (TPMS)" },
                      { value: "لمبة البطارية أو نظام الشحن والمولد" },
                      { value: "لا توجد أي لمبات تحذيرية" }
                    ]
                  }
                }
              }
            },
            location: { index: 4 }
          }
        },
        {
          createItem: {
            item: {
              title: "ملاحظات الفاحص الإضافية وتوصيات الصيانة",
              description: "سجل أي أصوات حركية، مشاكل في التكييف، تهريب سوائل، أو أية ملاحظات أخرى بالتفصيل",
              questionItem: {
                question: {
                  required: false,
                  textQuestion: {
                    paragraph: true
                  }
                }
              }
            },
            location: { index: 5 }
          }
        }
      ]
    })
  });

  if (!batchRes.ok) {
    const err = await batchRes.json();
    console.error('Batch update failed:', err);
    // Return formId and formUrl anyway because the form was created
  }

  return { formId, formUrl, responderUrl };
};

/**
 * Creates a generic Workshop Rating & Feedback Forum (استبيان تقييم صيانة الورشة)
 */
export const createFeedbackSurvey = async (
  accessToken: string
): Promise<FormsCreationResult> => {
  const formTitle = "استبيان تقييم جودة الصيانة ومستوى الورش المعتمدة";
  
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      info: {
        title: formTitle,
        documentTitle: "أوتو كير - تقييم الورشة",
        description: "مشاركتك تساعدنا في تقييم أداء الورش وتحسين مستوى الخدمة والأسعار لجميع مستخدمي أوتو كير."
      }
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Feedback Form');
  }

  const form = await createRes.json();
  const formId = form.formId;
  const formUrl = `https://docs.google.com/forms/d/${formId}/edit`;
  const responderUrl = form.responderUrl;

  const batchRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          createItem: {
            item: {
              title: "اسم الورشة أو المركز الذي تمت الصيانة عنده",
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {
                    paragraph: false
                  }
                }
              }
            },
            location: { index: 0 }
          }
        },
        {
          createItem: {
            item: {
              title: "نوع الخدمة المقدمة",
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: "RADIO",
                    options: [
                      { value: "ميكانيكا وإصلاح محرك" },
                      { value: "برمجة وفحص كمبيوتر" },
                      { value: "فرامل وإطارات وميزان" },
                      { value: "سمكرة وبويا (تعديل خارجي)" },
                      { value: "زيوت وفلاتر وصيانة دورية خفيفة" }
                    ]
                  }
                }
              }
            },
            location: { index: 1 }
          }
        },
        {
          createItem: {
            item: {
              title: "تقييمك لمصداقية وجودة الإصلاح والبرمجة",
              description: "حدد درجة الرضا عن دقة التشخيص والإصلاح",
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: "RADIO",
                    options: [
                      { value: "ممتاز جداً - تم حل المشكلة من أول زيارة" },
                      { value: "جيد - تم الإصلاح ولكن تطلب وقتاً إضافياً" },
                      { value: "مقبول - أداء متوسط" },
                      { value: "سيء - العيب عاد للظهور مجدداً" }
                    ]
                  }
                }
              }
            },
            location: { index: 2 }
          }
        },
        {
          createItem: {
            item: {
              title: "تقييمك لعدالة الأسعار وتكلفة قطع الغيار والعمالة",
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: "RADIO",
                    options: [
                      { value: "منافسة جداً ومناسبة" },
                      { value: "متوسطة ومقبولة" },
                      { value: "مرتفعة ومكلفة" }
                    ]
                  }
                }
              }
            },
            location: { index: 3 }
          }
        },
        {
          createItem: {
            item: {
              title: "هل تم استخدام خصومات أوتو كير المعتمدة؟ (كوبونات الخصم)",
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: "RADIO",
                    options: [
                      { value: "نعم، تم تفعيل الكوبون والحصول على الخصم بنجاح" },
                      { value: "لا، لم يكن العرض متوافقاً مع الورشة الحالية" },
                      { value: "لا، لم أكن أعلم بوجود كوبون خصم للشركة" }
                    ]
                  }
                }
              }
            },
            location: { index: 4 }
          }
        },
        {
          createItem: {
            item: {
              title: "ملاحظات إضافية وتوصية لرواد مجتمع أوتو كير",
              questionItem: {
                question: {
                  required: false,
                  textQuestion: {
                    paragraph: true
                  }
                }
              }
            },
            location: { index: 5 }
          }
        }
      ]
    })
  });

  if (!batchRes.ok) {
    const err = await batchRes.json();
    console.error('Batch update failed:', err);
  }

  return { formId, formUrl, responderUrl };
};
